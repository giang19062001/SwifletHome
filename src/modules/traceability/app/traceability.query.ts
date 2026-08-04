import { TeamStatusEnum } from 'src/interfaces/admin.interface';
import { OPTION_CONST } from 'src/modules/options/option.const';
import { RequestSellStatusEnum } from 'src/modules/qr/common/qr.enum';

export const TRACE_FORM_OPTIONS_SQL = {
  diLotCode: ` SELECT A.requestCode AS value, CONCAT(A.requestCode, '-', C.valueOption) AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            JOIN tbl_option_common C 
            ON B.ingredientNestOptionCode = C.code
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode AND B.requestSellStatus = ${RequestSellStatusEnum.SOLD}`,
  diClassification: ` SELECT keyOption AS value, valueOption AS label
            FROM tbl_option_common WHERE mainOption = '${OPTION_CONST.CONSIGNMENT_NEST.NEST_TYPE.mainOption}' AND subOption = '${OPTION_CONST.CONSIGNMENT_NEST.NEST_TYPE.subOption}'`,
  rmInputLot: ` SELECT A.requestCode AS value, CONCAT(A.requestCode, '-', C.valueOption) AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            JOIN tbl_option_common C 
            ON B.ingredientNestOptionCode = C.code
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode AND B.requestSellStatus = ${RequestSellStatusEnum.PURCHARSER}`,
  rmTeamExecution: ` SELECT teamCode as value, teamName as label FROM tbl_team_user
            WHERE userCode = :userCode AND status = ${TeamStatusEnum.APPROVE}`,
};
