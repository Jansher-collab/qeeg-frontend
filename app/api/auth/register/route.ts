import { NextRequest } from "next/server";
import { POST as signupPost } from "../signup/route";

export async function POST(req: NextRequest) {
  return signupPost(req);
}
