import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HolidayJobs } from "@/components/HolidayJobs";
import { cvData } from "@/lib/cv/data";
import { getLabels } from "@/lib/i18n/getLabels";

describe("HolidayJobs", () => {
  it("renders the count and the company list", () => {
    render(<HolidayJobs jobs={cvData.holidayJobs} labels={getLabels("nl-BE")} />);
    /* the entry's title is a heading like every other entry's */
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("+ 5 vakantiejobs");
    expect(screen.getByText("+ 5 vakantiejobs")).toHaveClass("vaktitle");
    expect(
      screen.getByText("bij Bpost, Storaenso, Houtshop Van der Gucht, V3 Consulting… 2017 - 2022"),
    ).toBeInTheDocument();
  });
});
