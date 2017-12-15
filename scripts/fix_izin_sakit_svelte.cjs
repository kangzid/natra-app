const fs = require('fs');

const filePath = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan/izin-sakit/+page.svelte';
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  const buggySection = `                            {#if req.attachment_path || req.attachment_base64}
                                        <div class="inline-flex items-center gap-1">
                                            <button 
                                                onclick={() => openSecurePreview('/hris/requests/' + req.id + '/preview-attachment', data.token, req.attachment_name || 'Surat Dokter')}
                                                class="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-medium border border-blue-200 dark:border-blue-900 transition-colors"
                                            >
                                                <Eye class="w-3.5 h-3.5" /> Surat Dokter
                                            </button>
                                            <button 
                                                onclick={() => downloadSecureFile('/hris/requests/' + req.id + '/download-attachment', data.token, req.attachment_name || 'surat_dokter')}
                                                class="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                title="Unduh Lampiran"
                                            >
                                                <Download class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    {:else}
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                                <XCircle class="w-3 h-3" /> Ditolak
                            </span>
                        {/if}
                    </div>

                    <div class="flex items-center gap-1.5">`;

  const fixedSection = `                            {#if req.attachment_path || req.attachment_base64}
                                <div class="inline-flex items-center gap-1">
                                    <button 
                                        onclick={() => openSecurePreview('/hris/requests/' + req.id + '/preview-attachment', data.token, req.attachment_name || 'Surat Dokter')}
                                        class="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-medium border border-blue-200 dark:border-blue-900 transition-colors"
                                    >
                                        <Eye class="w-3.5 h-3.5" /> Surat Dokter
                                    </button>
                                    <button 
                                        onclick={() => downloadSecureFile('/hris/requests/' + req.id + '/download-attachment', data.token, req.attachment_name || 'surat_dokter')}
                                        class="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        title="Unduh Lampiran"
                                    >
                                        <Download class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            {/if}
                        </div>

                        {#if req.reason}
                            <p class="text-xs text-foreground/80 italic pt-1">"{req.reason}"</p>
                        {/if}

                        {#if req.approver_note && req.status !== 'pending'}
                            <div class="text-[11px] text-muted-foreground pt-0.5">
                                Catatan: <span class="text-foreground">{req.approver_note}</span>
                            </div>
                        {/if}
                    </div>
                </div>

                <div class="flex items-center gap-3 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border">
                    <div>
                        {#if req.status === 'pending'}
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                <Clock class="w-3 h-3" /> Pending
                            </span>
                        {:else if req.status === 'approved'}
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <CheckCircle2 class="w-3 h-3" /> Disetujui
                            </span>
                        {:else}
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                                <XCircle class="w-3 h-3" /> Ditolak
                            </span>
                        {/if}
                    </div>

                    <div class="flex items-center gap-1.5">`;

  content = content.replace(buggySection, fixedSection);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully fixed Svelte izin-sakit compilation error!');
}
