import { TeamStatusEnum } from 'src/interfaces/admin.interface';
import { OPTION_CONST } from 'src/modules/options/option.const';
import { RequestSellStatusEnum } from 'src/modules/qr/common/qr.enum';

export const TRACE_FORM_OPTIONS_SQL = {
  diClassification: ` SELECT keyOption AS value, valueOption AS label
            FROM tbl_option_common WHERE mainOption = '${OPTION_CONST.CONSIGNMENT_NEST.NEST_TYPE.mainOption}' AND subOption = '${OPTION_CONST.CONSIGNMENT_NEST.NEST_TYPE.subOption}'`,
  rmTeamExecution: ` SELECT teamCode as value, teamName as label FROM tbl_team_user
            WHERE status = ${TeamStatusEnum.APPROVE} AND isActive =  'Y' `,
  diLotCode: ` SELECT A.requestCode AS value, A.requestCode AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode AND B.requestSellStatus = ${RequestSellStatusEnum.PACKING}`, // giao nhận
  rmInputLot: ` SELECT A.requestCode AS value, A.requestCode AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode AND B.requestSellStatus = '${RequestSellStatusEnum.PURCHASED}'`, // chế biến
  lfpInputProcessings: ` SELECT A.requestCode AS value, A.requestCode AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode AND B.requestSellStatus = '${RequestSellStatusEnum.PROCESSING}'`, // đóng gói

  dLotFinished: ` SELECT A.requestCode AS value, A.requestCode AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode AND B.requestSellStatus = '${RequestSellStatusEnum.DELIVERING}'`, // phân phối / hoàn trả

  rLotRecall: ` SELECT A.requestCode AS value, A.requestCode AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode AND B.requestSellStatus = '${RequestSellStatusEnum.DELIVERING}'`, // phân phối / hoàn trả
};
