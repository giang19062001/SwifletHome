import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { QuestionResDto } from 'src/modules/question/question.response';
import { IChatHistory } from '../chat/chat.interface';
import { LoggingService } from '../logger/logger.service';

@Injectable()
export class LlmService {
  private readonly SERVICE_NAME = 'LlmService';

  constructor(private readonly logger: LoggingService) {}

  async replyWithLLM(question: string, allQuestions: QuestionResDto[], chatHistories: IChatHistory[] = []): Promise<{ answerCode: string | null; intent: 'NEW' | 'REPEAT' | 'SUMMARIZE' | 'CLARIFY' }> {
    const apiKey = process.env.LLM_GEMINI_KEY;
    const modelName = process.env.LLM_GEMINI_MODEL;

    if (!apiKey || !allQuestions?.length) return { answerCode: null, intent: 'NEW' };

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName!,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              answerCode: { type: SchemaType.STRING },
              intent: {
                type: SchemaType.STRING,
                description: 'The intent of the user (NEW, REPEAT, SUMMARIZE, CLARIFY)',
              },
            },
            required: ['answerCode', 'intent'],
          },
          maxOutputTokens: 500,
          temperature: 0.1,
        },
      });

      // Nhóm các câu hỏi mẫu theo answerCode để rút gọn prompt
      const groupedQuestions = new Map<string, string[]>();
      allQuestions.forEach((q) => {
        if (!groupedQuestions.has(q.answerCode)) {
          groupedQuestions.set(q.answerCode, []);
        }
        groupedQuestions.get(q.answerCode)!.push(q.questionContent);
      });

      const contextItems = Array.from(groupedQuestions.entries()).map(([code, queries]) => {
        return `answerCode: ${code} | Sample Questions: [${queries.join(', ')}]`;
      });

      const prompt = `
        BẠN LÀ CHUYÊN GIA PHÂN LOẠI Ý ĐỊNH CÂU HỎI.
        Nhiệm vụ của bạn là dựa trên "CÂU HỎI KHÁCH HÀNG", hãy tìm "answerCode" phù hợp nhất từ "DỮ LIỆU MẪU".

        DỮ LIỆU MẪU:
        ${contextItems.join('\n')}

        LỊCH SỬ TRÒ CHUYỆN (Gần nhất):
        ${
          chatHistories.length > 0
            ? chatHistories
                .slice(-3)
                .map((h) => `User: ${h.user} -> Bot_AnswerCode: ${h.assistant}`)
                .join('\n')
            : 'Trống'
        }

        QUY TẮC PHÂN LOẠI:
        1. Phân tích "CÂU HỎI KHÁCH HÀNG" hiện tại.
        2. Nếu câu hỏi yêu cầu hành động dựa trên câu trả lời trước đó (ví dụ: "nhắc lại", "tóm tắt lại", "nói rõ hơn", "không hiểu", "tại sao"...), hãy lấy answerCode từ "LỊCH SỬ TRÒ CHUYỆN" và xác định "intent" tương ứng.
        3. Nếu là câu hỏi mới, hãy tìm answerCode phù hợp nhất trong "DỮ LIỆU MẪU" và đặt intent là "NEW".
        4. Nếu không tìm thấy, trả về answerCode null và intent "NEW".

        ĐỊNH DẠNG TRẢ VỀ (BẮT BUỘC JSON):
        {
          "answerCode": "mã_answerCode" hoặc null,
          "intent": "NEW" | "REPEAT" | "SUMMARIZE" | "CLARIFY"
        }

        LƯU Ý INTENT:
        - "REPEAT": khi user muốn nhắc lại, copy lại câu cũ.
        - "SUMMARIZE": khi user muốn tóm tắt, nói ngắn gọn.
        - "CLARIFY": khi user bảo không hiểu, muốn giải thích rõ hơn, chi tiết hơn.
        - "NEW": các trường hợp còn lại.

        CÂU HỎI KHÁCH HÀNG: "${question}"
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      this.logger.log('replyWithLLM: text LLM ------------> ', text);

      // Tìm và bóc tách JSON một cách mạnh mẽ hơn
      let jsonRes: any = null;

      try {
        // Thử parse trực tiếp nếu text sạch
        jsonRes = JSON.parse(text);
      } catch (e) {
        // Nếu parse lỗi, thử tìm khối { ... } JSON
        const jsonBlocks = text.match(/\{[\s\S]*?\}/g);
        if (jsonBlocks) {
          // Duyệt từ cuối lên đầu vì câu trả lời cuối cùng thường là kết quả chốt
          for (let i = jsonBlocks.length - 1; i >= 0; i--) {
            try {
              const block = jsonBlocks[i];
              const parsed = JSON.parse(block);
              if (parsed.answerCode !== undefined) {
                jsonRes = parsed;
                break;
              }
            } catch (innerError) {}
          }
        }
      }

      if (!jsonRes) return { answerCode: null, intent: 'NEW' };
      const answerCode = jsonRes.answerCode || null;
      const intent = jsonRes.intent || 'NEW';

      if (answerCode === 'null' || answerCode === 'none' || answerCode === '' || !answerCode) {
        return { answerCode: null, intent: 'NEW' };
      }

      console.log(`LLM Result -> Code: ${answerCode}, Intent: ${intent}`);
      return { answerCode, intent };
    } catch (error) {
      this.logger.error(`${this.SERVICE_NAME}/replyWithLLM Error: ${error.message}`, error.stack);
      return { answerCode: null, intent: 'NEW' };
    }
  }

  async generateRefinedResponse(content: string, mode: 'SUMMARIZE' | 'CLARIFY'): Promise<string> {
    const apiKey = process.env.LLM_GEMINI_KEY;
    const modelName = process.env.LLM_GEMINI_MODEL;
    if (!apiKey) return content;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName! });

      const prompt = `
        BẠN LÀ TRỢ LÝ THÔNG MINH. 
        Nhiệm vụ: Hãy ${mode === 'SUMMARIZE' ? 'TÓM TẮT' : 'GIẢI THÍCH CHI TIẾT VÀ DỄ HIỂU HƠN'} nội dung sau đây.
        
        LƯU Ý QUAN TRỌNG: 
        1. Giữ nguyên các thẻ định dạng đặc biệt như [[audio-data=...]] và [[payment]] nếu chúng xuất hiện trong văn bản. Không được xóa hay thay đổi chúng.
        2. Chỉ trả về nội dung sau khi đã ${mode === 'SUMMARIZE' ? 'tóm tắt' : 'giải thích'}.

        NỘI DUNG:
        ${content}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      // trả về nguyển bản nếu lỗi
      return content;
    }
  }
}
