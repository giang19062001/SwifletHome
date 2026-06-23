import { Injectable } from '@nestjs/common';
import { APP_SCREENS } from 'src/helpers/const.helper';
import { replaceNbspToSpace } from 'src/helpers/func.helper';
import { ScreenRequestDoctorResDto } from '../../screen.response';
import { IScreenStrategy } from '../screen.interface';
import { ScreenAppRepository } from '../screen.repository';
import { GetContentScreenResDto } from '../screen.response';

@Injectable()
export class RequestDoctorStrategy implements IScreenStrategy {
  constructor(private readonly screenAppRepository: ScreenAppRepository) {}

  canHandle(keyword: string): boolean {
    return keyword === APP_SCREENS.REQUEST_DOCTOR;
  }

  async execute(screen: any): Promise<GetContentScreenResDto | null> {
    let tableVideo = null;
    let supportContent = screen.screenSupportContent;
    if (typeof supportContent === 'string') {
      try {
        supportContent = JSON.parse(supportContent);
      } catch (e) {}
    }
    if (supportContent?.tables?.video) {
      tableVideo = supportContent.tables.video;
    }

    let videos: any[] = [];
    if (tableVideo) {
      videos = await this.screenAppRepository.getAllVideosByTable(tableVideo);
    }
    const groupedVideos = videos.reduce((acc: any, curr: any) => {
      const key = curr.name + '|' + curr.address;
      if (!acc[key]) {
        acc[key] = {
          name: curr.name,
          address: curr.address,
          listVideoYoutobe: [],
        };
      }
      acc[key].listVideoYoutobe.push({
        videoTitle: curr.videoTitle,
        videoUrl: curr.videoUrl,
      });
      return acc;
    }, {});

    let center = screen.contentCenter;
    if (typeof center === 'string') {
      try {
        center = JSON.parse(center);
      } catch (e) {}
    }

    return {
      contentStart: replaceNbspToSpace(screen.contentStart ?? ''),
      contentCenter: {
        title: screen.screenName,
        ...center,
        listVideo: Object.values(groupedVideos),
      },
      contentEnd: replaceNbspToSpace(screen.contentEnd ?? ''),
    } as ScreenRequestDoctorResDto;
  }
}
