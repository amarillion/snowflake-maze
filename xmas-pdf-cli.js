#!/usr/bin/env node

import { makePdf } from "./src/pdfGenerator.js";

import fs from "fs";

const paperSize = "A4"; // A4 | LETTER
const pipe = fs.createWriteStream(`output-${paperSize}.pdf`);
makePdf(paperSize, pipe);
