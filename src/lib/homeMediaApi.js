import { supabase } from "./supabaseClient";

const BUCKET = "home-media";
const HOME_MEDIA_ID = 1;

export async function fetchHomeMedia() {
  try {
    const { data, error } = await supabase
      .from("home_media")
      .select("*")
      .eq("id", HOME_MEDIA_ID)
      .maybeSingle();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

const deleteStoragePath = async (path) => {
  if (!path) return { error: null };
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return { error };
};

const uploadHomeMediaFile = async ({ file, type, existingPath }) => {
  if (existingPath) {
    const { error: deleteErr } = await deleteStoragePath(existingPath);
    if (deleteErr) throw deleteErr;
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `home/${type}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) throw new Error("Public URL generation failed");

  return { path: filePath, url: publicUrl };
};

export async function upsertHomeMedia({
  current,
  videoFile,
  imageOneFile,
  imageTwoFile
}) {
  try {
    const payload = {
      id: HOME_MEDIA_ID,
      video_url: current?.videoUrl || null,
      video_path: current?.videoPath || null,
      image_one_url: current?.imageOneUrl || null,
      image_one_path: current?.imageOnePath || null,
      image_two_url: current?.imageTwoUrl || null,
      image_two_path: current?.imageTwoPath || null
    };

    if (videoFile) {
      const uploaded = await uploadHomeMediaFile({
        file: videoFile,
        type: "video",
        existingPath: current?.videoPath
      });
      payload.video_url = uploaded.url;
      payload.video_path = uploaded.path;
    }

    if (imageOneFile) {
      const uploaded = await uploadHomeMediaFile({
        file: imageOneFile,
        type: "image-one",
        existingPath: current?.imageOnePath
      });
      payload.image_one_url = uploaded.url;
      payload.image_one_path = uploaded.path;
    }

    if (imageTwoFile) {
      const uploaded = await uploadHomeMediaFile({
        file: imageTwoFile,
        type: "image-two",
        existingPath: current?.imageTwoPath
      });
      payload.image_two_url = uploaded.url;
      payload.image_two_path = uploaded.path;
    }

    const { data, error } = await supabase
      .from("home_media")
      .upsert(payload)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}
