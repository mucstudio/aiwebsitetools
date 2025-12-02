import { generateRobotsTxt } from "@/lib/metadata"

export default async function robots() {
  const content = await generateRobotsTxt()

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
