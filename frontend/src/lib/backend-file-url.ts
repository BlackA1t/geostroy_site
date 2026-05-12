function getBackendApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  return apiUrl.replace(/\/+$/, "");
}

export function getUserRequestFileDownloadUrl(requestId: string, fileId: string) {
  return `${getBackendApiUrl()}/requests/${requestId}/files/${fileId}/download`;
}

export function getAdminRequestFileDownloadUrl(requestId: string, fileId: string) {
  return `${getBackendApiUrl()}/admin/requests/${requestId}/files/${fileId}/download`;
}

export function getAdminGuestRequestFileDownloadUrl(guestRequestId: string, fileId: string) {
  return `${getBackendApiUrl()}/admin/guest-requests/${guestRequestId}/files/${fileId}/download`;
}
