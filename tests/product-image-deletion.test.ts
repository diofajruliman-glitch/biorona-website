import assert from "node:assert/strict";
import test from "node:test";
import { commitPendingImageDeletion, ProductImageDeletionError, productImageStoragePath, thumbnailAfterRemoval } from "../lib/admin/product-image-deletion.ts";

const image = (id: string) => ({ id, storage_path: `11111111-1111-4111-8111-111111111111/${id}.jpg` });

test("hapus gambar biasa mempertahankan thumbnail", () => assert.equal(thumbnailAfterRemoval(["a", "b"], "b", "a"), "a"));
test("hapus thumbnail memilih gambar tersisa pertama", () => assert.equal(thumbnailAfterRemoval(["a", "b", "c"], "b", "b"), "a"));
test("hapus gambar terakhir menghasilkan thumbnail null-equivalent", () => assert.equal(thumbnailAfterRemoval(["a"], "a", "a"), ""));

test("database gagal tidak menghapus Storage", async () => {
  let storageCalled = false;
  await assert.rejects(commitPendingImageDeletion({
    deleteMetadata: async () => ({ error: { message: "database down" } }),
    removeStorage: async () => { storageCalled = true; return { error: null }; },
  }, [image("a")]), (error) => error instanceof ProductImageDeletionError && error.stage === "database");
  assert.equal(storageCalled, false);
});

test("Storage gagal dilaporkan setelah metadata berhasil", async () => {
  let metadataCalled = false;
  await assert.rejects(commitPendingImageDeletion({
    deleteMetadata: async () => { metadataCalled = true; return { error: null }; },
    removeStorage: async () => ({ error: { message: "storage denied" } }),
  }, [image("a")]), (error) => error instanceof ProductImageDeletionError && error.stage === "storage");
  assert.equal(metadataCalled, true);
});

test("pengguna non-admin ditolak dan Storage tidak dipanggil", async () => {
  let storageCalled = false;
  await assert.rejects(commitPendingImageDeletion({
    deleteMetadata: async () => ({ error: { code: "42501", message: "row-level security policy" } }),
    removeStorage: async () => { storageCalled = true; return { error: null }; },
  }, [image("a")]), (error) => error instanceof ProductImageDeletionError && error.stage === "database");
  assert.equal(storageCalled, false);
});

test("path diekstrak dari public URL dan bukan full URL", () => {
  assert.equal(productImageStoragePath({ storage_path: "https://invalid.example/full.jpg", image_url: "https://project.supabase.co/storage/v1/object/public/product-images/11111111-1111-4111-8111-111111111111/foto%20utama.jpg" }), "11111111-1111-4111-8111-111111111111/foto utama.jpg");
});
