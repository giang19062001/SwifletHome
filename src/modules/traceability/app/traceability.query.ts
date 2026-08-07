import { TeamStatusEnum } from 'src/interfaces/admin.interface';
import { RequestSellStatusEnum } from 'src/modules/qr/common/qr.enum';

export const TRACE_FORM_CONFIG_OPTIONS_SQL = {
  hiNumberHarvest: ` SELECT 
                B.harvestPhase AS value, 
                B.harvestPhase AS label,
                DATE_FORMAT(B.createdAt, '%Y-%m-%d') AS hiStartDateHarvest,
                COALESCE(DATE_FORMAT(B.updatedAt, '%Y-%m-%d'), '') AS hiEndDateHarvest,
                CAST(SUM(COALESCE(C.cellCollected, 0)) AS SIGNED) AS hmNumberNests
            FROM tbl_user_home A
            LEFT JOIN tbl_todo_task_harvest_phase B ON A.userCode = B.userCode AND A.userHomeCode = B.userHomeCode
            LEFT JOIN tbl_todo_task_harvest C ON B.seq = C.seqHarvestPhase
            WHERE B.seq IS NOT NULL AND  A.userCode = :userCode AND A.userHomeCode = :userHomeCode 
            GROUP BY  B.harvestPhase,  B.createdAt, B.updatedAt;`,
  rmTeamExecution: ` SELECT teamCode as value, teamName as label FROM tbl_team_user
            WHERE status = ${TeamStatusEnum.APPROVE} AND isActive =  'Y' `,
  diLotCode: ` SELECT A.requestCode AS value, A.requestCode AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode`, //  AND B.requestSellStatus = ${RequestSellStatusEnum.PACKING}: giao nhận
  rmInputLot: ` SELECT A.requestCode AS value, A.requestCode AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode`, // AND B.requestSellStatus = '${RequestSellStatusEnum.PURCHASED}': chế biến
  lfpInputProcessings: ` SELECT A.requestCode AS value, A.requestCode AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode`, // AND B.requestSellStatus = '${RequestSellStatusEnum.PROCESSING}':  đóng gói

  dLotFinished: ` SELECT A.requestCode AS value, A.requestCode AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode`, // AND B.requestSellStatus = '${RequestSellStatusEnum.DELIVERING}': phân phối / hoàn trả

  rLotRecall: ` SELECT A.requestCode AS value, A.requestCode AS label  FROM tbl_qr_request A
            JOIN tbl_qr_request_selling B 
            ON A.requestCode = B.requestCode
            WHERE A.userCode = :userCode AND A.userHomeCode = :userHomeCode `, // AND B.requestSellStatus = '${RequestSellStatusEnum.DELIVERING}':  phân phối / hoàn trả
};

export const TRACE_FORM_DEFAULT_CURRENT_VALUE_SQL = {
  OWNER_INFO: ` SELECT userName AS representative, userPhone AS ownerPhone FROM tbl_user_app WHERE userCode = :userCode `,
  FACILITY_INFO: ` SELECT 
        A.userHomeName AS facilityName, 
        A.userHomeAddress AS facilityAddress, 
        CONCAT(A.userHomeWidth, ' * ', A.userHomeLength) AS facilityArea, 
        A.userHomeFloor AS facilityFloor, 
        DATE_FORMAT(A.createdAt, '%Y-%m-%d') AS facilityActiveTime,
        B.userName AS personInCharge,
        C1.harvestPhase,
        IFNULL(SUM(D.cellCollected), 0) AS totalCellCollected
    FROM tbl_user_home A 
    JOIN tbl_user_app B 
        ON A.userCode = B.userCode 
        AND B.isActive = 'Y'
    LEFT JOIN tbl_todo_task_harvest_phase C1 
        ON C1.userCode = B.userCode 
        AND C1.userHomeCode = A.userHomeCode
        AND C1.isActive = 'Y'
    LEFT JOIN tbl_todo_task_harvest_phase C2 
        ON C2.userCode = C1.userCode 
        AND C2.userHomeCode = C1.userHomeCode 
        AND C1.seq < C2.seq
        AND C2.isActive = 'Y'
    LEFT JOIN tbl_todo_task_harvest D 
        ON D.userCode = B.userCode 
        AND D.userHomeCode = A.userHomeCode 
        AND D.seqHarvestPhase = C1.seq
        AND D.isActive = 'Y'
    WHERE 
        A.isActive = 'Y'
        AND C2.seq IS NULL 
        AND A.userCode = :userCode
        AND A.userHomeCode = :userHomeCode
    GROUP BY 
        A.userHomeCode,
        A.userHomeName, 
        A.userHomeAddress, 
        A.userHomeWidth, 
        A.userHomeLength, 
        A.userHomeFloor, 
        A.createdAt, 
        B.userName, 
        C1.harvestPhase `,
};
