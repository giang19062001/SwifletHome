import { TODO_CONST } from 'src/modules/todo/common/todo.const';
import { generateSeriCode } from './traceability.func';
import { TEXTS } from 'src/helpers/text.helper';

export const TRACE_FORM_LIST_FIELD_SQL = {
  shtTodoList: ` SELECT 
                  A.taskName, 
                  DATE_FORMAT(A.taskDate, '%Y-%m-%d') AS taskDate, 
                  CASE 
                    WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.COMPLETE.value}' THEN '${TODO_CONST.TASK_STATUS.COMPLETE.text}'
                    WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.WAITING.value}' THEN '${TODO_CONST.TASK_STATUS.WAITING.text}'
                    WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.CANCEL.value}' THEN '${TODO_CONST.TASK_STATUS.CANCEL.text}'
                    WHEN A.taskStatus = '${TODO_CONST.TASK_STATUS.SKIP.value}' THEN '${TODO_CONST.TASK_STATUS.SKIP.text}'
                    ELSE A.taskStatus
                  END AS taskStatus 
                FROM tbl_todo_task_alarm A 
                WHERE A.userCode = :userCode 
                  AND A.userHomeCode = :userHomeCode 
                  AND A.isActive = 'Y' AND A.taskName != 'LURING'
                ORDER BY A.taskDate DESC, A.seq DESC `,

  shmMedicine: ` SELECT  B.valueOption, A.medicineUsage, DATE_FORMAT(A.createdAt, '%Y-%m-%d %H:%i:%s') AS createdAt
                FROM tbl_todo_task_medicine A
                JOIN tbl_option_common B
                ON A.medicineOptionCode = B.code 
                WHERE A.userCode = :userCode 
                AND A.userHomeCode = :userHomeCode 
                AND A.isActive = 'Y'
                ORDER BY A.taskDate DESC, A.seq DESC    `,
};

export const TRACE_FORM_CONFIG_OPTIONS_SQL = {
  hiNumberHarvest: ` SELECT 
                    B.harvestPhase AS value,
                    CONCAT(
                        '${TEXTS.PHASE} ', B.harvestPhase,
                        ' - ',
                        CAST(SUM(COALESCE(C.cellCollected, 0)) AS SIGNED),
                         ' ${TEXTS.NEST_TITLE} '
                        ' - ${TEXTS.HARVEST_DATE} ',
                        DATE_FORMAT(B.createdAt, '%Y/%m/%d')
                    ) AS label
                FROM tbl_user_home A
                LEFT JOIN tbl_todo_task_harvest_phase B 
                    ON A.userCode = B.userCode 
                    AND A.userHomeCode = B.userHomeCode
                LEFT JOIN tbl_todo_task_harvest C 
                    ON B.seq = C.seqHarvestPhase
                WHERE B.seq IS NOT NULL
                    AND A.userCode = :userCode
                    AND A.userHomeCode = :userHomeCode
                GROUP BY 
                    B.harvestPhase,
                    B.createdAt,
                    B.updatedAt; `,
};

export const TRACE_FORM_DEFAULT_CURRENT_VALUE_SQL = {
  EXPORT_INFO: ` SELECT A.userName AS exporter FROM tbl_user_app A WHERE A.userCode = :userCode`,
  FACILITY_INFO: ` SELECT 
        A.userHomeName AS facilityName, 
        A.userHomeAddress AS facilityAddress, 
        CONCAT(A.userHomeWidth, ' * ', A.userHomeLength) AS facilityArea, 
        A.userHomeFloor AS facilityFloor, 
        DATE_FORMAT(A.createdAt, '%Y-%m-%d') AS facilityActiveTime,
        B.userName AS personInCharge,
        C1.harvestPhase,
        IFNULL(SUM(D.cellCollected), 0) AS recentYield
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

export const TRACE_FORM_DEFAULT_CURRENT_VALUE_GENERATE = {
  psSeri: generateSeriCode('PS-SERI'),
  exportTime: () => new Date().toISOString().replace('T', ' ').substring(0, 19),
  entireExportFile: (traceabilityId?: string) => (traceabilityId ? `/api/app/traceability/downloadPdf/${traceabilityId}` : null),
};
