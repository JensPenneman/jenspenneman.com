import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HolidayJobs } from "@/components/HolidayJobs";
import { cvData } from "@/lib/cv/data";
import { RANGE_DASH } from "@/lib/format/rangeDash";
import { getLabels } from "@/lib/i18n/getLabels";

describe("HolidayJobs", () => {
  it("renders the count and the company list", () => {
    const { container } = render(
      <HolidayJobs jobs={cvData.holidayJobs} labels={getLabels("nl-BE")} />,
    );
    expect(container.querySelector(".vaktitle")?.textContent).toBe("+\u00a05 vakantiejobs");
    expect(screen.getByText(/Bpost/).textContent).toBe(
      `bij Bpost, Storaenso, Houtshop Van der Gucht, V3 Consulting… 2017${RANGE_DASH}2022`,
    );
  });
});
