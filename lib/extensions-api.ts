export type ExtensionStatus = "active" | "inactive";

export type Extension = {
  id: string;
  name: string;
  description: string;
  status: ExtensionStatus;
  avatarUrl: string | null;
  dateCreated: string;
};

type ExtensionsResponse = {
  success: boolean;
  message: string;
  data: {
    extensions: Extension[];
  };
};

const API_URL = "https://api-backend-test-0qvm.onrender.com/api/v1/extensions";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(body: unknown, status: number): string {
  if (isRecord(body) && typeof body.message === "string") {
    return body.message;
  }
  if (typeof body === "string" && body.trim()) {
    return body;
  }
  return `The request failed (${status}). Please try again.`;
}

export async function getExtensions(): Promise<Extension[]> {
  const response = await fetch(API_URL);
  const body = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
  if (
    !isRecord(body) ||
    !isRecord(body.data) ||
    !Array.isArray(body.data.extensions)
  ) {
    throw new Error("The extensions service returned an unexpected response.");
  }

  return (body as ExtensionsResponse).data.extensions;
}

export async function updateExtensionStatus(
  id: string,
  status: ExtensionStatus,
): Promise<void> {
  const formData = new FormData();
  formData.set("status", status);

  const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: formData,
  });
  const body = await readResponse(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
}

export async function deleteExtension(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const body = await readResponse(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }
}
