import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { QuestionResDto } from 'src/modules/question/question.response';
import { LoggingService } from '../logger/logger.service';

@Injectable()
export class LlmService {
  private readonly SERVICE_NAME = 'LlmService';

  constructor(private readonly logger: LoggingService) {}

  async replyWithLLM(question: string, allQuestions: QuestionResDto[]): Promise<{ answerCode: string | null }> {
    const groqApiKey = process.env.LLM_GROQ_KEY;
    const modelName = process.env.LLM_GROQ_MODEL;
    if (!groqApiKey || !allQuestions?.length) return { answerCode: null };

    try {
      const groq = new Groq({ apiKey: groqApiKey });

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
        Nhiệm vụ của bạn là dựa trên "CÂU HỎI KHÁCH HÀNG", hãy tìm "answerCode" phù hợp nhất từ "DỮ LIỆU MẪU".

        DỮ LIỆU MẪU:
        ${contextItems.join('\n')}

        QUY TẮC PHÂN LOẠI:
        1. Phân tích "CÂU HỎI KHÁCH HÀNG" hiện tại.
        2. Tìm answerCode phù hợp nhất trong "DỮ LIỆU MẪU".
        3. Nếu không tìm thấy, trả về answerCode null.

        ĐỊNH DẠNG TRẢ VỀ (BẮT BUỘC JSON):
        {
          "answerCode": "mã_answerCode" hoặc null
        }

        LƯU Ý QUAN TRỌNG:
        - "answerCode" phải được sao chép CHÍNH XÁC từ DỮ LIỆU MẪU (ví dụ: "ANS000029", giữ nguyên đủ chữ số 0, tuyệt đối không được tự ý viết tắt hoặc bỏ bớt chữ số 0 thành "ANS00029").

        CÂU HỎI KHÁCH HÀNG: "${question}"
      `;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'BẠN LÀ CHUYÊN GIA PHÂN LOẠI Ý ĐỊNH CÂU HỎI. Vui lòng CHỈ TRẢ VỀ kết quả dưới định dạng JSON, không giải thích gì thêm.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: modelName!,
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0]?.message?.content?.trim() || '';
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

      if (!jsonRes) return { answerCode: null };
      let answerCode = jsonRes.answerCode || null;

      if (answerCode === 'null' || answerCode === 'none' || answerCode === '' || !answerCode) {
        return { answerCode: null };
      }

      // Chuẩn hóa answerCode: nếu LLM trả về dạng thiếu số 0 (ví dụ ANS00029 thay vì ANS000029)
      const match = answerCode.match(/^ANS(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        answerCode = `ANS${num.toString().padStart(6, '0')}`;
      }

      console.log(`LLM Result -> Code: ${answerCode}`);
      return { answerCode };
    } catch (error: any) {
      this.logger.error(`${this.SERVICE_NAME}/replyWithLLM Error: ${error.message}`, error.stack);
      return { answerCode: null };
    }
  }
}
