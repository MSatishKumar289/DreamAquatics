const LiveUpdatePanel = ({
  handleHomeMediaUpload,
  homeMediaError,
  homeMediaDraft,
  loadHomeMediaFromDb,
  handleSaveHomeMedia,
  isHomeMediaSaving
}) => (
  <section className="md:col-span-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Home screen</p>
        <h2 className="text-lg font-semibold text-slate-900">Live update</h2>
      </div>
    </div>

    <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">Video</p>
          <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
            Upload video
            <input
              type="file"
              accept="video/*"
              onChange={handleHomeMediaUpload("video")}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">Image one</p>
          <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
            Upload image one
            <input
              type="file"
              accept="image/*"
              onChange={handleHomeMediaUpload("imageOne")}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">Image two</p>
          <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
            Upload image two
            <input
              type="file"
              accept="image/*"
              onChange={handleHomeMediaUpload("imageTwo")}
              className="hidden"
            />
          </label>
        </div>

        {homeMediaError && <p className="text-sm text-rose-600">{homeMediaError}</p>}
      </div>

      <div className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
          <p className="mb-2 font-semibold text-slate-600">Video preview</p>
          {homeMediaDraft.videoUrl ? (
            <video
              src={homeMediaDraft.videoUrl}
              className="h-36 w-full rounded-md object-contain bg-black"
              muted
              controls
            />
          ) : (
            <div className="flex h-36 items-center justify-center rounded-md border border-dashed border-slate-200 bg-white">
              Upload a video to preview.
            </div>
          )}
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
          <p className="mb-2 font-semibold text-slate-600">Image one preview</p>
          {homeMediaDraft.imageOneUrl ? (
            <img
              src={homeMediaDraft.imageOneUrl}
              alt="Highlight one preview"
              className="h-28 w-full rounded-md object-contain bg-white"
            />
          ) : (
            <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-slate-200 bg-white">
              Upload an image to preview.
            </div>
          )}
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
          <p className="mb-2 font-semibold text-slate-600">Image two preview</p>
          {homeMediaDraft.imageTwoUrl ? (
            <img
              src={homeMediaDraft.imageTwoUrl}
              alt="Highlight two preview"
              className="h-28 w-full rounded-md object-contain bg-white"
            />
          ) : (
            <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-slate-200 bg-white">
              Upload an image to preview.
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="mt-6 flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={loadHomeMediaFromDb}
        className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSaveHomeMedia}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-70"
        disabled={isHomeMediaSaving}
      >
        {isHomeMediaSaving ? "Saving..." : "Save"}
      </button>
    </div>
  </section>
);

export default LiveUpdatePanel;
