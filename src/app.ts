export default async function main(envs: Record<string, string | undefined>) {
  console.log(envs.PORT);
}

await main(process.env);
