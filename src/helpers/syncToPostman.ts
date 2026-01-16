import ora from "ora";
import pc from "picocolors";

type PostmanCollection = Record<string, any>;

export async function syncToPostman(
  collectionData: PostmanCollection
): Promise<void> {
  const apiKey = process.env.POSTMAN_API_KEY;
  const collectionId = process.env.COLLECTION_ID;

  if (!apiKey || !collectionId) {
    console.log(
      pc.yellow(
        "\n⚠️ API Key veya Collection ID bulunamadı, senkronizasyon atlandı."
      )
    );
    return;
  }

  const spinner = ora(pc.cyan("Postman koleksiyonu güncelleniyor...")).start();

  try {
    const res = await fetch(
      `https://api.getpostman.com/collections/${collectionId}`,
      {
        method: "PUT",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collection: collectionData,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${res.statusText} - ${text}`);
    }

    spinner.succeed(pc.green("Postman başarıyla güncellendi!"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    spinner.fail(pc.red("Postman güncellenirken hata: " + message));
  }
}
