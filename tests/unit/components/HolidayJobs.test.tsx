import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HolidayJobs } from "@/components/HolidayJobs";
import { cvData } from "@/lib/cv/data";

describe("HolidayJobs", () => {
  it("renders the count and the company list", () => {
    render(<HolidayJobs jobs={cvData.holidayJobs} />);
    expect(screen.getByText("+ 5 vakantiejobs")).toBeInTheDocument();
    expect(
      screen.getByText("bij Bpost, Storaenso, Houtshop Van der Gucht, V3 Consulting… 2017 - 2022"),
    ).toBeInTheDocument();
  });
});
