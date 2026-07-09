import { StatusBadge } from "../../components/StatusBadge";
import type { Phase0JudgementDraft, Phase0MessyRecord } from "./phase0-types";

const kindLabels: Record<Phase0JudgementDraft["possibleKind"], string> = {
  help_request_candidate: "求助候選",
  site_status_candidate: "地點狀態候選",
  task_candidate: "任務候選",
  assignment_candidate: "人員指派候選",
  announcement_candidate: "公告候選",
  unknown: "候選類型待判斷",
};

const confidenceLabels: Record<Phase0JudgementDraft["confidence"], string> = {
  low: "低",
  medium: "中",
  high: "高",
};

const priorityLabels: Record<Phase0JudgementDraft["priority"], string> = {
  low: "低",
  medium: "中",
  high: "高",
};

const nextStepLabels: Record<
  Phase0JudgementDraft["suggestedNextStep"],
  string
> = {
  keep_raw: "先保留原始資訊",
  ask_for_more_info: "補問來源或現場資訊",
  send_to_human_review: "交給人工確認",
  create_candidate_report: "建立候選通報",
  create_site_update_suggestion: "建立地點更新建議",
  do_not_use_yet: "暫時不要使用",
};

export function Phase0JudgementCard({
  judgement,
  record,
}: {
  judgement: Phase0JudgementDraft;
  record: Phase0MessyRecord;
}) {
  return (
    <article className="judgement-card">
      <div className="judgement-card__header">
        <div>
          <p className="eyebrow">整理草稿</p>
          <h3>可編輯的候選判斷</h3>
        </div>
        <StatusBadge status={record.verificationStatus} />
      </div>

      <p>
        這份草稿是下一位協作者可以修正與討論的候選結果，並不是正式資料模型。
      </p>

      <dl className="judgement-summary">
        <div>
          <dt>候選類型</dt>
          <dd>{kindLabels[judgement.possibleKind]}</dd>
        </div>
        <div>
          <dt>信心程度</dt>
          <dd>{confidenceLabels[judgement.confidence]}</dd>
        </div>
        <div>
          <dt>下一步</dt>
          <dd>{nextStepLabels[judgement.suggestedNextStep]}</dd>
        </div>
        <div>
          <dt>優先級</dt>
          <dd>{priorityLabels[judgement.priority]}</dd>
        </div>
        <div>
          <dt>負責角色</dt>
          <dd>{judgement.owner}</dd>
        </div>
        <div>
          <dt>衝突備註</dt>
          <dd>{judgement.conflictNote ?? "無"}</dd>
        </div>
      </dl>

      <p>
        能否直接行動：
        <strong>
          {judgement.unsafeToActDirectly ? "不可直接行動" : "仍需確認情境"}
        </strong>
      </p>

      <section>
        <h4>行動分流</h4>
        <ul>
          <li>
            <strong>可行動</strong>：{judgement.unsafeToActDirectly ? "否" : "視情境而定"}
          </li>
          <li>
            <strong>待確認</strong>：{judgement.suggestedNextStep === "send_to_human_review" ? "是" : "否"}
          </li>
          <li>
            <strong>暫緩</strong>：{judgement.unsafeToActDirectly ? "是" : "否"}
          </li>
        </ul>
      </section>

      <section>
        <h4>下一步建議</h4>
        <p>{nextStepLabels[judgement.suggestedNextStep]}</p>
      </section>

      <section>
        <h4>候選觀察</h4>
        <p>
          {judgement.humanReviewNote
            ? "這筆資料已被標記為需要人工確認，並保留為候選觀察。"
            : "這筆資料仍是候選觀察，未被視為正式任務或已確認事實。"}
        </p>
      </section>

      {judgement.humanReviewNote ? (
        <section>
          <h4>人類修正</h4>
          <p>{judgement.humanReviewNote}</p>
        </section>
      ) : null}

      <section>
        <h4>判斷依據</h4>
        <ul>
          {judgement.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4>目前卡住的地方</h4>
        <ul>
          {judgement.blockers.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
