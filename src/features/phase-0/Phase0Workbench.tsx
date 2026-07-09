import { useMemo, useState } from "react";
import { RecordCard } from "../../components/RecordCard";
import { StatusBadge } from "../../components/StatusBadge";
import { Phase0JudgementCard } from "./Phase0JudgementCard";
import { createPhase0Judgement } from "./phase0-heuristics";
import type {
  Phase0Confidence,
  Phase0JudgementDraft,
  Phase0MessyRecord,
  Phase0PossibleKind,
  Phase0SuggestedNextStep,
} from "./phase0-types";

const kindOptions: Array<{ value: Phase0PossibleKind; label: string }> = [
  { value: "unknown", label: "候選類型待判斷" },
  { value: "help_request_candidate", label: "求助候選" },
  { value: "site_status_candidate", label: "地點狀態候選" },
  { value: "task_candidate", label: "任務候選" },
  { value: "assignment_candidate", label: "人員指派候選" },
  { value: "announcement_candidate", label: "公告候選" },
];

const confidenceOptions: Array<{ value: Phase0Confidence; label: string }> = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
];

const nextStepOptions: Array<{
  value: Phase0SuggestedNextStep;
  label: string;
}> = [
  { value: "keep_raw", label: "先保留原始資訊" },
  { value: "ask_for_more_info", label: "補問來源或現場資訊" },
  { value: "send_to_human_review", label: "交給人工確認" },
  { value: "create_candidate_report", label: "建立候選通報" },
  { value: "create_site_update_suggestion", label: "建立地點更新建議" },
  { value: "do_not_use_yet", label: "暫時不要使用" },
];

function createDraftForRecord(record: Phase0MessyRecord): Phase0JudgementDraft {
  const base = createPhase0Judgement(record);

  const overrides: Partial<Phase0JudgementDraft> = {};

  if (record.id === "M-001") {
    overrides.possibleKind = "help_request_candidate";
    overrides.confidence = "medium";
    overrides.evidence = [
      "來源是社群口耳，沒有確切地址與確認者。",
      "看起來像求助候選，但不適合直接派工。",
    ];
    overrides.blockers = [
      "缺少精確地點與確認人。",
      "不能直接把這筆內容變成任務。",
    ];
    overrides.suggestedNextStep = "send_to_human_review";
    overrides.unsafeToActDirectly = true;
    overrides.humanReviewNote =
      "人類修正：這像是求助候選，但仍需現場確認與地址補齊。";
  } else if (record.id === "M-003") {
    overrides.possibleKind = "site_status_candidate";
    overrides.confidence = "medium";
    overrides.evidence = [
      "記錄提到資源需求已轉變，可能是地點狀態更新。",
      "但原始內容沒有說明更新來源與時間。",
    ];
    overrides.blockers = [
      "資源狀態可能已變更，但沒有可追溯來源。",
      "不能直接把它當成已確認的現場狀態。",
    ];
    overrides.suggestedNextStep = "ask_for_more_info";
    overrides.unsafeToActDirectly = true;
    overrides.humanReviewNote =
      "人類修正：這段話更像地點狀態更新，而不是已確認任務。";
  } else if (record.id === "M-009") {
    overrides.possibleKind = "site_status_candidate";
    overrides.confidence = "high";
    overrides.evidence = [
      "現場志工提供了集合點與限制條件。",
      "內容比一般社群貼文更具現場脈絡。",
    ];
    overrides.blockers = [
      "仍然缺少官方公告同步與完整上下文。",
      "不能直接把它當成正式公告。",
    ];
    overrides.suggestedNextStep = "create_site_update_suggestion";
    overrides.unsafeToActDirectly = true;
    overrides.humanReviewNote =
      "人類修正：這筆資料值得留作候選更新，但不應直接發布。";
  } else if (record.id === "M-010") {
    overrides.possibleKind = "site_status_candidate";
    overrides.confidence = "high";
    overrides.evidence = [
      "記錄有明確的現場盤點與剩餘物資數量。",
      "看起來像一筆可留存的現場狀態更新。",
    ];
    overrides.blockers = [
      "仍需確認盤點者身份與更新時間。",
      "不能直接把這些數字當成官方統計。",
    ];
    overrides.suggestedNextStep = "create_site_update_suggestion";
    overrides.unsafeToActDirectly = true;
    overrides.humanReviewNote =
      "人類修正：這筆看起來品質較高，但仍應保留為候選更新。";
  } else if (record.id === "M-011") {
    overrides.possibleKind = "help_request_candidate";
    overrides.confidence = "medium";
    overrides.evidence = [
      "描述了潛在需要協助搬家具的個案。",
      "但涉及個人位置與隱私，不能直接公開。",
    ];
    overrides.blockers = [
      "缺少當事人同意與完整定位資訊。",
      "不能直接轉成任務流程。",
    ];
    overrides.suggestedNextStep = "send_to_human_review";
    overrides.unsafeToActDirectly = true;
    overrides.humanReviewNote =
      "人類修正：這很像需要協助的案例，但必須先由人員進一步確認隱私與安全。";
  }

  return {
    ...base,
    ...overrides,
  };
}

function buildInitialDrafts(records: Phase0MessyRecord[]) {
  const drafts: Record<string, Phase0JudgementDraft> = {};

  records.slice(0, 6).forEach((record) => {
    drafts[record.id] = createDraftForRecord(record);
  });

  return drafts;
}

export function Phase0Workbench({
  records,
  selectedRecordId,
  onSelect,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
}) {
  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0];
  const [drafts, setDrafts] = useState<Record<string, Phase0JudgementDraft>>(
    () => buildInitialDrafts(records),
  );

  const draftCount = useMemo(() => Object.keys(drafts).length, [drafts]);
  const currentDraft = drafts[selectedRecord.id];

  function updateDraftField<K extends keyof Phase0JudgementDraft>(
    field: K,
    value: Phase0JudgementDraft[K],
  ) {
    setDrafts((previous) => ({
      ...previous,
      [selectedRecord.id]: {
        ...previous[selectedRecord.id],
        [field]: value,
      } as Phase0JudgementDraft,
    }));
  }

  function handleCreateDraft() {
    setDrafts((previous) => ({
      ...previous,
      [selectedRecord.id]: createDraftForRecord(selectedRecord),
    }));
  }

  function handleResetDraft() {
    setDrafts((previous) => ({
      ...previous,
      [selectedRecord.id]: createPhase0Judgement(selectedRecord),
    }));
  }

  function handleDeleteDraft() {
    setDrafts((previous) => {
      const next = { ...previous };
      delete next[selectedRecord.id];
      return next;
    });
  }

  return (
    <div className="workbench">
      <div className="workbench__intro">
        <p className="eyebrow">整理工作台</p>
        <h2>第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。</h2>
        <p>
          這裡讓下一位協作者先建立、編輯與修正草稿，並把「不能直接變成任務」與「需要人工確認」的線索留下來。
        </p>
      </div>

      <div className="workbench__layout">
        <aside className="workbench__queue" aria-label="選擇原始資訊">
          {records.map((record) => (
            <button
              className={record.id === selectedRecord.id ? "active" : ""}
              key={record.id}
              type="button"
              onClick={() => onSelect(record.id)}
            >
              <span>{record.id}</span>
              <StatusBadge status={record.verificationStatus} />
            </button>
          ))}
        </aside>

        <div className="workbench__main">
          <RecordCard record={selectedRecord} />

          <div className="workbench__controls">
            <p className="workbench__count">
              已建立 {draftCount}/{records.length} 份整理草稿
            </p>
            <div className="workbench__toolbar">
              <button type="button" onClick={handleCreateDraft}>
                建立草稿
              </button>
              <button type="button" onClick={handleResetDraft}>
                重設為安全預設
              </button>
              <button type="button" onClick={handleDeleteDraft}>
                刪除草稿
              </button>
            </div>
          </div>

          {currentDraft ? (
            <>
              <Phase0JudgementCard
                judgement={currentDraft}
                record={selectedRecord}
              />

              <section className="draft-form">
                <h3>編輯整理草稿</h3>
                <label>
                  候選類型
                  <select
                    value={currentDraft.possibleKind}
                    onChange={(event) =>
                      updateDraftField(
                        "possibleKind",
                        event.target.value as Phase0PossibleKind,
                      )
                    }
                  >
                    {kindOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  信心程度
                  <select
                    value={currentDraft.confidence}
                    onChange={(event) =>
                      updateDraftField(
                        "confidence",
                        event.target.value as Phase0Confidence,
                      )
                    }
                  >
                    {confidenceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  下一步
                  <select
                    value={currentDraft.suggestedNextStep}
                    onChange={(event) =>
                      updateDraftField(
                        "suggestedNextStep",
                        event.target.value as Phase0SuggestedNextStep,
                      )
                    }
                  >
                    {nextStepOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="draft-form__checkbox">
                  <input
                    checked={currentDraft.unsafeToActDirectly}
                    onChange={(event) =>
                      updateDraftField(
                        "unsafeToActDirectly",
                        event.target.checked,
                      )
                    }
                    type="checkbox"
                  />
                  不能直接變成任務
                </label>

                <label>
                  判斷依據（每行一項）
                  <textarea
                    value={currentDraft.evidence.join("\n")}
                    onChange={(event) =>
                      updateDraftField(
                        "evidence",
                        event.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </label>

                <label>
                  卡住原因（每行一項）
                  <textarea
                    value={currentDraft.blockers.join("\n")}
                    onChange={(event) =>
                      updateDraftField(
                        "blockers",
                        event.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </label>

                <label>
                  人類修正與確認備註
                  <textarea
                    value={currentDraft.humanReviewNote ?? ""}
                    onChange={(event) =>
                      updateDraftField(
                        "humanReviewNote",
                        event.target.value || undefined,
                      )
                    }
                  />
                </label>
              </section>
            </>
          ) : (
            <div className="empty-state">
              <p>這筆資訊目前沒有草稿，請先建立一份。</p>
            </div>
          )}
        </div>

        <aside className="workbench__checklist">
          <h3>第一階段完成檢查</h3>
          <ul>
            <li>已載入 {records.length} 筆原始資訊</li>
            <li>可建立、編輯、重設與刪除整理草稿</li>
            <li>至少 6 筆資訊已被整理成可編輯草稿</li>
            <li>至少 2 個候選判斷由人類修正與備註</li>
            <li>至少 3 筆資訊被標示為不能直接變成任務</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
