import cv from "@/content/cv.json";

/** The CV data model (validated against src/content/cv.schema.json). */
export const cvData = cv;

export type CvData = typeof cv;
export type Work = CvData["work"][number];
export type Education = CvData["education"][number];
export type Certificate = CvData["certificates"][number];
export type Skill = CvData["skills"][number];
export type Language = CvData["languages"][number];
