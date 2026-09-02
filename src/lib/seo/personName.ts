import { cvData } from "@/lib/cv/data";

const [given = "", ...family] = cvData.basics.name.split(" ");

export const givenName = given;
export const familyName = family.join(" ");
