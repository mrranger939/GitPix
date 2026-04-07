import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { imageBase64, fileName, password } = await req.json();

    // 🔐 Password check
    if (password !== process.env.APP_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!imageBase64 || !fileName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Optional: file type check
    if (!fileName.match(/\.(png|jpg|jpeg|webp)$/)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const uniqueName = `${Date.now()}-${fileName}`;

    const githubRes = await fetch(
      `https://api.github.com/repos/${process.env.REPO}/contents/images/${uniqueName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `upload ${uniqueName}`,
          content: imageBase64,
        }),
      }
    );

    if (!githubRes.ok) {
      const err = await githubRes.json();
      console.error(err);
      return NextResponse.json({ error: "GitHub upload failed" }, { status: 500 });
    }

    const url = `https://raw.githubusercontent.com/${process.env.REPO}/main/images/${uniqueName}`;

    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}