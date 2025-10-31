import { Injectable } from '@nestjs/common';
import Fuse, { IFuseOptions } from 'fuse.js';
import { messageErr } from 'src/helpers/message';
import { ISearchItem } from './search.interface';

@Injectable()
export class SearchService {
  private readonly fuseOptions: IFuseOptions<ISearchItem> = {
    keys: ['questions'],
    threshold: 0.3, // Smaller → more accurate result
    includeScore: true,
    ignoreLocation: true,
    ignoreFieldNorm: true,
  };

  // Standardize text for search comparison
  private normalizeText(text: string): string {
    return (
      text
        .toLowerCase()
        // .normalize('NFD') // split accented characters into letters + separator: yen => y + ̂ (caret) + e + ́ (sharp accent) + n
        // .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents after separating accents
        // .replace(/[^a-z0-9\s]/g, '') // remove special characters
        .trim()
    );
  }

  /*Find the closest answer in the FAQ list*/
  findAnswer(query: string, faqData: ISearchItem[]): string {
    if (!faqData?.length) {
      return messageErr.faqEmpty;
    }

    // normalized data
    const normalizedData = faqData.map((item) => ({
      ...item,
      questions: item.questions.map((q) => this.normalizeText(q)),
    }));

    // Initialize Fuse.js with normalized data
    const fuse = new Fuse(normalizedData, this.fuseOptions);
    const normalizedQuery = this.normalizeText(query);

    // finding...
    const results = fuse.search(normalizedQuery);

    // If no suitable results are found
    if (results.length === 0) {
      return messageErr.cannotReply;
    }

    // Get the most relevant results
    return results[0].item.answer;
  }
}
