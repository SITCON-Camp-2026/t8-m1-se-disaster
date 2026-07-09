import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/app/App";

describe("App", () => {
  it("renders starter title", () => {
    render(<App />);
    expect(screen.getByText("災害資訊整理工作台")).toBeInTheDocument();
  });

  it("keeps the home page focused on phase 0 tabs", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: "原始資訊" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "整理工作台" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "通報" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "地點" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "志工任務" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "人員指派" }),
    ).not.toBeInTheDocument();
  });

  it("shows review states in the phase 0 workbench", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(
      screen.getByText(
        "第一階段的成功不是分類正確，而是把為什麼現在還不能判斷說清楚。",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("待人工確認").length).toBeGreaterThan(0);
    expect(screen.getAllByText("未查核").length).toBeGreaterThan(0);
  });

  it("lets learners create, edit, and reset draft judgements", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(screen.getByText(/已建立 \d+\/\d+ 份整理草稿/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /建立草稿/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "重設為安全預設" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "刪除草稿" }),
    ).toBeInTheDocument();
  });

  it("surfaces candidate observations and human review cues", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(screen.getByText("候選觀察")).toBeInTheDocument();
    expect(screen.getAllByText(/人工確認/).length).toBeGreaterThan(0);
  });

  it("shows action triage and next-step guidance", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(screen.getByText("行動分流")).toBeInTheDocument();
    expect(screen.getByText("可行動")).toBeInTheDocument();
    expect(screen.getByText("待確認")).toBeInTheDocument();
    expect(screen.getByText("暫緩")).toBeInTheDocument();
    expect(screen.getAllByText(/下一步建議/).length).toBeGreaterThan(0);
  });
});
