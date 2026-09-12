"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { requireAdminSession } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type DraftImage = { key: string; id?: string; storagePath?: string; url: string; alt: string; file?: File };
type FormState = {
  name:string;sku:string;slug:string;categoryId:string;price:string;originalPrice:string;
  shortDescription:string;description:string;seoDescription:string;colors:string;
  occasions:string;tags:string;available:boolean;preorder:boolean;featured:boolean;
  bestseller:boolean;leadTime:string;sortOrder:string;isActive:boolean;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_EDGE = 4096;
const MAX_IMAGE_PIXELS = 16_000_000;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const emptyForm: FormState = { name:"",sku:"",slug:"",categoryId:"",price:"",originalPrice:"",shortDescription:"",description:"",seoDescription:"",colors:"",occasions:"",tags:"",available:true,preorder:false,featured:false,bestseller:false,leadTime:"",sortOrder:"0",isActive:true };
const splitList = (value:string) => value.split(",").map(item=>item.trim()).filter(Boolean);
const slugify = (value:string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

async function validateImage(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) return `${file.name}: format tidak didukung.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: ukuran melebihi 5 MB.`;
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    if (width > MAX_IMAGE_EDGE || height > MAX_IMAGE_EDGE || width * height > MAX_IMAGE_PIXELS) {
      return `${file.name}: resolusi terlalu besar. Maksimal 4096 × 4096 px dan 16 megapiksel.`;
    }
  } catch {
    return `${file.name}: gambar tidak dapat dibaca atau rusak.`;
  }
  return "";
}

function productPayload(form: FormState, isActive = form.isActive) {
  return {
    sku:form.sku.trim(),slug:form.slug.trim(),name:form.name.trim(),category_id:form.categoryId,
    price:Number(form.price),original_price:form.originalPrice?Number(form.originalPrice):null,
    short_description:form.shortDescription.trim(),description:form.description.trim(),seo_description:form.seoDescription.trim(),
    colors:splitList(form.colors),occasions:splitList(form.occasions),tags:splitList(form.tags),
    available:form.available,preorder:form.preorder,featured:form.featured,bestseller:form.bestseller,
    lead_time:form.leadTime.trim()||null,sort_order:Number(form.sortOrder),is_active:isActive,
  };
}

function restoreProductPayload(product: ProductRow) {
  return {
    sku:product.sku,slug:product.slug,name:product.name,category:product.category,category_id:product.category_id,price:product.price,
    original_price:product.original_price,short_description:product.short_description,description:product.description,
    seo_description:product.seo_description,colors:product.colors,occasions:product.occasions,tags:product.tags,
    available:product.available,preorder:product.preorder,featured:product.featured,bestseller:product.bestseller,
    lead_time:product.lead_time,sort_order:product.sort_order,is_active:product.is_active,
  };
}

export default function ProductEditor({ productId }: { productId?: string }) {
  const [form,setForm]=useState<FormState>(emptyForm);
  const [categories,setCategories]=useState<CategoryRow[]>([]);
  const [images,setImages]=useState<DraftImage[]>([]);
  const [removedImages,setRemovedImages]=useState<ImageRow[]>([]);
  const [thumbnailKey,setThumbnailKey]=useState("");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const originalProduct=useRef<ProductRow|null>(null);
  const originalImages=useRef<ImageRow[]>([]);
  const previews=useMemo(()=>images.filter(image=>image.url),[images]);

  useEffect(()=>{
    requireAdminSession().then(async({supabase})=>{
      const categoryResult=await supabase.from("categories").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true });
      if(categoryResult.error)throw categoryResult.error;
      const availableCategories = (categoryResult.data ?? []) as CategoryRow[];
      const activeCategories = availableCategories.filter((category) => category.is_active);
      setCategories(availableCategories);

      const nextDefaultId = activeCategories[0]?.id ?? "";
      setForm(current => ({
        ...current,
        categoryId: current.categoryId || nextDefaultId,
      }));

      if(!productId) {
        setLoading(false);
        return;
      }

      const productResult=await supabase.from("products").select("*").eq("id",productId).single();
      if(productResult.error)throw productResult.error;
      const p=productResult.data as ProductRow;
      const imageResult=await supabase.from("product_images").select("*").eq("product_id",productId).order("sort_order");
      if(imageResult.error)throw imageResult.error;
      const rows=imageResult.data as ImageRow[];
      const selectedCategory = availableCategories.find((category) => category.id === p.category_id);
      originalProduct.current=p;
      originalImages.current=rows;
      setForm({name:p.name,sku:p.sku,slug:p.slug,categoryId:selectedCategory?.id ?? "",price:String(p.price),originalPrice:p.original_price===null?"":String(p.original_price),shortDescription:p.short_description,description:p.description,seoDescription:p.seo_description,colors:p.colors.join(", "),occasions:p.occasions.join(", "),tags:p.tags.join(", "),available:p.available,preorder:p.preorder,featured:p.featured,bestseller:p.bestseller,leadTime:p.lead_time??"",sortOrder:String(p.sort_order),isActive:p.is_active});
      const loaded=rows.map(image=>({key:image.id,id:image.id,storagePath:image.storage_path,url:image.image_url,alt:image.alt_text}));
      setImages(loaded);
      setThumbnailKey(loaded.find((_,index)=>rows[index]?.is_thumbnail)?.key??loaded[0]?.key??"");
    }).catch(reason=>setError(reason instanceof Error?reason.message:"Produk gagal dimuat.")).finally(()=>setLoading(false));
  },[productId]);

  function field<K extends keyof FormState>(key:K,value:FormState[K]){setForm(current=>({...current,[key]:value}));}

  async function addFiles(event:ChangeEvent<HTMLInputElement>){
    const files=[...(event.target.files??[])];
    event.target.value="";
    setError("");
    const accepted:DraftImage[]=[];
    const validationErrors:string[]=[];
    for(const file of files){
      const validationError=await validateImage(file);
      if(validationError){validationErrors.push(validationError);continue;}
      accepted.push({key:crypto.randomUUID(),url:URL.createObjectURL(file),alt:form.name?`${form.name} dari Biorona Florist`:"",file});
    }
    if(validationErrors.length)setError(validationErrors.join(" "));
    setImages(current=>{
      const next=[...current,...accepted];
      if(!thumbnailKey&&next[0])setThumbnailKey(next[0].key);
      return next;
    });
  }

  function move(index:number,direction:-1|1){const target=index+direction;if(target<0||target>=images.length)return;setImages(current=>{const next=[...current];[next[index],next[target]]=[next[target],next[index]];return next;});}

  function removeImage(image:DraftImage){
    if(!window.confirm("Hapus gambar ini saat produk disimpan?"))return;
    if(image.file)URL.revokeObjectURL(image.url);
    if(image.id){
      const row=originalImages.current.find(item=>item.id===image.id);
      if(row)setRemovedImages(current=>current.some(item=>item.id===row.id)?current:[...current,row]);
    }
    const remaining=images.filter(item=>item.key!==image.key);
    setImages(remaining);
    if(thumbnailKey===image.key)setThumbnailKey(remaining[0]?.key??"");
    setSuccess("Gambar ditandai untuk dihapus. Klik Simpan produk untuk menerapkan.");
  }

  async function submit(event:FormEvent){
    event.preventDefault();setError("");setSuccess("");
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)){setError("Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.");return;}
    if(!splitList(form.colors).length){setError("Tambahkan minimal satu warna agar produk dapat dipesan.");return;}
    if(!splitList(form.occasions).length){setError("Tambahkan minimal satu occasion/acara agar produk dapat dipesan.");return;}
    if(!images.length){setError("Tambahkan minimal satu gambar produk sebelum menyimpan.");return;}
    if(!thumbnailKey||!images.some(image=>image.key===thumbnailKey)){setError("Pilih satu gambar sebagai thumbnail.");return;}
    if(images.some(image=>!image.alt.trim())){setError("Alt text wajib diisi untuk setiap gambar.");return;}
    const selectedCategory=categories.find(category=>category.id===form.categoryId);
    if(!selectedCategory){setError("Pilih kategori produk yang valid.");return;}
    if(!selectedCategory.is_active&&originalProduct.current?.category_id!==selectedCategory.id){setError("Kategori yang dipilih sedang nonaktif. Aktifkan kategori terlebih dahulu.");return;}

    setSaving(true);
    const uploadedPaths:string[]=[];
    const insertedImageIds:string[]=[];
    let createdProductId:string|undefined;
    let supabase:Awaited<ReturnType<typeof requireAdminSession>>["supabase"]|undefined;
    try{
      ({supabase}=await requireAdminSession());
      const payload=productPayload(form);
      let id=productId;
      if(!id){
        const result=await supabase.from("products").insert({...payload,is_active:false}).select("id").single();
        if(result.error)throw result.error;
        id=result.data.id;createdProductId=id;
      }

      const resolved:{key:string;id:string}[]=[];
      for(const[index,image]of images.entries()){
        let imageId=image.id;
        if(image.file){
          const extension=image.file.name.split(".").pop()?.toLowerCase()||"jpg";
          const storagePath=`${id}/${crypto.randomUUID()}.${extension}`;
          const upload=await supabase.storage.from("product-images").upload(storagePath,image.file,{contentType:image.file.type,cacheControl:"31536000"});
          if(upload.error)throw upload.error;
          uploadedPaths.push(storagePath);
          const publicUrl=supabase.storage.from("product-images").getPublicUrl(storagePath).data.publicUrl;
          const inserted=await supabase.from("product_images").insert({product_id:id,image_url:publicUrl,storage_path:storagePath,alt_text:image.alt.trim(),sort_order:index,is_thumbnail:false}).select("id").single();
          if(inserted.error)throw inserted.error;
          imageId=inserted.data.id;insertedImageIds.push(imageId);
        }else if(image.id){
          const updated=await supabase.from("product_images").update({alt_text:image.alt.trim(),sort_order:index,is_thumbnail:false}).eq("id",image.id);
          if(updated.error)throw updated.error;
        }
        if(imageId)resolved.push({key:image.key,id:imageId});
      }

      const clearThumbnail=await supabase.from("product_images").update({is_thumbnail:false}).eq("product_id",id);
      if(clearThumbnail.error)throw clearThumbnail.error;
      const thumbnail=resolved.find(item=>item.key===thumbnailKey);
      if(!thumbnail)throw new Error("Thumbnail produk tidak dapat ditentukan.");
      const thumbnailResult=await supabase.from("product_images").update({is_thumbnail:true}).eq("id",thumbnail.id);
      if(thumbnailResult.error)throw thumbnailResult.error;
      const productResult=await supabase.from("products").update(payload).eq("id",id);
      if(productResult.error)throw productResult.error;

      for(const image of removedImages){
        if(image.storage_path){
          const storageResult=await supabase.storage.from("product-images").remove([image.storage_path]);
          if(storageResult.error)throw new Error(`Gagal menghapus file gambar: ${storageResult.error.message}`);
        }
        const imageResult=await supabase.from("product_images").delete().eq("id",image.id);
        if(imageResult.error)throw new Error(`Gagal menghapus metadata gambar: ${imageResult.error.message}`);
      }

      setRemovedImages([]);
      setSuccess(productId?"Perubahan produk berhasil disimpan.":"Produk berhasil ditambahkan. Kembali ke daftar untuk melihatnya.");
      if(!productId)setTimeout(()=>window.location.replace("/admin/products/"),800);
    }catch(reason){
      const cleanupErrors:string[]=[];
      if(supabase){
        if(insertedImageIds.length){const cleanup=await supabase.from("product_images").delete().in("id",insertedImageIds);if(cleanup.error)cleanupErrors.push("metadata upload baru perlu dibersihkan manual");}
        if(uploadedPaths.length){const cleanup=await supabase.storage.from("product-images").remove(uploadedPaths);if(cleanup.error)cleanupErrors.push("file upload baru perlu dibersihkan manual");}
        if(createdProductId){const cleanup=await supabase.from("products").delete().eq("id",createdProductId);if(cleanup.error)cleanupErrors.push("draft produk perlu dibersihkan manual");}
        else if(productId&&originalProduct.current){
          const restore=await supabase.from("products").update(restoreProductPayload(originalProduct.current)).eq("id",productId);
          if(restore.error)cleanupErrors.push("data produk lama gagal dipulihkan");
          for(const image of originalImages.current){const restored=await supabase.from("product_images").update({alt_text:image.alt_text,sort_order:image.sort_order,is_thumbnail:image.is_thumbnail}).eq("id",image.id);if(restored.error)cleanupErrors.push("urutan atau thumbnail lama gagal dipulihkan");}
        }
      }
      const message=reason instanceof Error?reason.message:"Produk gagal disimpan.";
      setError(cleanupErrors.length?`${message} Pemulihan belum lengkap: ${[...new Set(cleanupErrors)].join(", ")}.`:message);
    }finally{setSaving(false);}
  }

  if(loading)return <div className="adminState" role="status">Memuat data produk…</div>;
  return <><header className="adminPageHeader"><div><span className="adminEyebrow">{productId?"Edit":"Produk baru"}</span><h1>{productId?"Edit produk":"Tambah produk"}</h1></div></header>{error&&<p className="adminNotice adminError" role="alert">{error}</p>}{success&&<p className="adminNotice" role="status">{success}</p>}<form className="adminForm" onSubmit={submit}><section><h2>Informasi utama</h2><div className="adminFormGrid"><label>Nama<input required value={form.name} onChange={e=>{field("name",e.target.value);if(!productId)field("slug",slugify(e.target.value));}}/></label><label>SKU<input required value={form.sku} onChange={e=>field("sku",e.target.value.toUpperCase())}/></label><label>Slug<input required value={form.slug} onChange={e=>field("slug",slugify(e.target.value))}/></label><label>Kategori<select required value={form.categoryId} onChange={e=>field("categoryId",e.target.value)} disabled={!categories.some(category=>category.is_active)&&!categories.some(category=>category.id===form.categoryId)}><option value="">Pilih kategori</option>{categories.map(category=><option key={category.id} value={category.id} disabled={!category.is_active&&originalProduct.current?.category_id!==category.id}>{category.name}{category.is_active?"":" (nonaktif)"}</option>)}</select>{!categories.some(category=>category.is_active)&&<small>Kategori aktif belum tersedia. Tambahkan atau aktifkan kategori terlebih dahulu.</small>}</label><label>Harga<input required min="0" type="number" inputMode="numeric" value={form.price} onChange={e=>field("price",e.target.value)}/></label><label>Harga lama <small>opsional</small><input min="0" type="number" inputMode="numeric" value={form.originalPrice} onChange={e=>field("originalPrice",e.target.value)}/></label><label>Lead time<input value={form.leadTime} onChange={e=>field("leadTime",e.target.value)} placeholder="Contoh: H-2"/></label><label>Sort order<input required type="number" value={form.sortOrder} onChange={e=>field("sortOrder",e.target.value)}/></label></div><label>Deskripsi singkat<textarea required rows={2} value={form.shortDescription} onChange={e=>field("shortDescription",e.target.value)}/></label><label>Deskripsi lengkap<textarea required rows={5} value={form.description} onChange={e=>field("description",e.target.value)}/></label><label>SEO description<textarea required rows={3} value={form.seoDescription} onChange={e=>field("seoDescription",e.target.value)}/></label></section><section><h2>Atribut</h2><div className="adminFormGrid"><label>Warna <small>minimal 1, pisahkan koma</small><input required value={form.colors} onChange={e=>field("colors",e.target.value)}/></label><label>Occasions <small>minimal 1, pisahkan koma</small><input required value={form.occasions} onChange={e=>field("occasions",e.target.value)}/></label><label>Tags <small>pisahkan koma</small><input value={form.tags} onChange={e=>field("tags",e.target.value)}/></label></div><div className="adminChecks">{([['available','Available'],['preorder','Pre-order'],['featured','Featured'],['bestseller','Bestseller'],['isActive','Produk aktif']] as const).map(([key,label])=><label key={key}><input type="checkbox" checked={form[key]} onChange={e=>field(key,e.target.checked)}/>{label}</label>)}</div></section><section><h2>Gambar produk</h2><p className="adminHint">JPEG, PNG, WebP, atau AVIF. Maksimal 5 MB, 4096 × 4096 px, dan 16 megapiksel.</p><label className="adminUpload">Pilih beberapa gambar<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={addFiles}/></label>{previews.length===0?<div className="adminEmpty compact">Minimal satu gambar wajib ditambahkan.</div>:<div className="adminImageList">{previews.map((image,index)=><article key={image.key}><img src={image.url} alt=""/><div><label>Alt text<input required value={image.alt} onChange={e=>setImages(current=>current.map(item=>item.key===image.key?{...item,alt:e.target.value}:item))}/></label><label className="thumbnailChoice"><input type="radio" name="thumbnail" checked={thumbnailKey===image.key} onChange={()=>setThumbnailKey(image.key)}/>Thumbnail</label><div className="adminActions"><button type="button" disabled={index===0} onClick={()=>move(index,-1)}>Naik</button><button type="button" disabled={index===images.length-1} onClick={()=>move(index,1)}>Turun</button><button type="button" className="danger" onClick={()=>removeImage(image)}>Hapus</button></div></div></article>)}</div>}</section><button className="adminPrimary adminSubmit" type="submit" disabled={saving}>{saving?"Menyimpan…":"Simpan produk"}</button></form></>;
}
