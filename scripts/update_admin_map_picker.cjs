const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const mapPickerPath = path.join(svelteDir, 'src/lib/components/map/map-picker.svelte');
const taskFormPath = path.join(svelteDir, 'src/lib/components/features/tasks/task-form.svelte');

// 1. New MapPicker with Nominatim Search, Large Modal View, and Resilient Leaflet Resize
const mapPickerContent = `<script lang="ts">
    import { onMount, onDestroy, tick } from "svelte";
    import { browser } from "$app/environment";
    import { Search, Maximize2, MapPin, Check, X, Loader2, Navigation } from "lucide-svelte";
    import "leaflet/dist/leaflet.css";

    let {
        lat = $bindable(null),
        lng = $bindable(null),
        address = $bindable(""),
        label = "Pilih Titik Lokasi",
        defaultCenter = [-6.2088, 106.8456], // Default to Jakarta area
        defaultZoom = 13,
        height = "h-[180px]"
    } = $props();

    let mapElement: HTMLElement;
    let fullMapElement: HTMLElement;
    let map: any = null;
    let fullMap: any = null;
    let marker: any = null;
    let fullMarker: any = null;
    let L: any = null;

    let searchQuery = $state("");
    let isSearching = $state(false);
    let searchResults = $state<Array<{ display_name: string; lat: string; lon: string }>>([]);
    let isFullModalOpen = $state(false);

    // Full modal temporary state
    let tempLat = $state<string | number | null>(lat);
    let tempLng = $state<string | number | null>(lng);
    let tempAddress = $state<string>(address || "");

    let resizeObserver: ResizeObserver | null = null;

    onMount(async () => {
        if (browser) {
            L = await import("leaflet");

            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            });

            initInlineMap();

            // Observe resize to fix blank map glitches
            if (mapElement && typeof ResizeObserver !== "undefined") {
                resizeObserver = new ResizeObserver(() => {
                    if (map) {
                        map.invalidateSize();
                    }
                });
                resizeObserver.observe(mapElement);
            }
        }
    });

    function initInlineMap() {
        if (!mapElement || !L) return;

        const initialLat = lat ? parseFloat(lat.toString()) : defaultCenter[0];
        const initialLng = lng ? parseFloat(lng.toString()) : defaultCenter[1];
        const hasCoords = lat && lng;

        map = L.map(mapElement, {
            zoomControl: true,
            attributionControl: false
        }).setView([initialLat, initialLng], hasCoords ? 15 : defaultZoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19
        }).addTo(map);

        if (hasCoords) {
            marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
            setupMarkerDrag(marker, false);
        }

        map.on('click', (e: any) => {
            const { lat: newLat, lng: newLng } = e.latlng;
            setCoordinates(newLat, newLng, false);
        });

        // Trigger multiple invalidates to ensure tiles load seamlessly inside modal dialogs
        setTimeout(() => map?.invalidateSize(), 100);
        setTimeout(() => map?.invalidateSize(), 300);
        setTimeout(() => map?.invalidateSize(), 600);
    }

    function setupMarkerDrag(m: any, isFull: boolean) {
        if (!m) return;
        m.on('dragend', (e: any) => {
            const position = m.getLatLng();
            setCoordinates(position.lat, position.lng, isFull);
        });
    }

    function setCoordinates(newLat: number, newLng: number, isFull: boolean) {
        const formattedLat = parseFloat(newLat.toFixed(7));
        const formattedLng = parseFloat(newLng.toFixed(7));

        if (isFull) {
            tempLat = formattedLat;
            tempLng = formattedLng;
            if (fullMarker) {
                fullMarker.setLatLng([formattedLat, formattedLng]);
            } else if (fullMap) {
                fullMarker = L.marker([formattedLat, formattedLng], { draggable: true }).addTo(fullMap);
                setupMarkerDrag(fullMarker, true);
            }
            if (fullMap) fullMap.panTo([formattedLat, formattedLng]);
        } else {
            lat = formattedLat;
            lng = formattedLng;
            if (marker) {
                marker.setLatLng([formattedLat, formattedLng]);
            } else if (map) {
                marker = L.marker([formattedLat, formattedLng], { draggable: true }).addTo(map);
                setupMarkerDrag(marker, false);
            }
            if (map) map.panTo([formattedLat, formattedLng]);
        }
    }

    async function handleSearch(e?: Event) {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        isSearching = true;
        searchResults = [];

        try {
            const res = await fetch(
                \`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(searchQuery)}&limit=5&countrycodes=id\`,
                { headers: { 'Accept-Language': 'id,en' } }
            );
            if (res.ok) {
                const data = await res.json();
                searchResults = data || [];
            }
        } catch (err) {
            console.error('Geocoding search error:', err);
        } finally {
            isSearching = false;
        }
    }

    function selectSearchResult(result: { display_name: string; lat: string; lon: string }, isFull: boolean) {
        const rLat = parseFloat(result.lat);
        const rLng = parseFloat(result.lon);

        if (isFull) {
            tempLat = rLat;
            tempLng = rLng;
            tempAddress = result.display_name;
            setCoordinates(rLat, rLng, true);
            if (fullMap) fullMap.setView([rLat, rLng], 16);
        } else {
            lat = rLat;
            lng = rLng;
            if (!address) address = result.display_name;
            setCoordinates(rLat, rLng, false);
            if (map) map.setView([rLat, rLng], 16);
        }

        searchResults = [];
        searchQuery = result.display_name.split(',')[0];
    }

    async function openFullMapModal() {
        tempLat = lat;
        tempLng = lng;
        tempAddress = address || "";
        isFullModalOpen = true;
        searchResults = [];

        await tick();
        setTimeout(() => {
            if (!fullMapElement || !L) return;

            if (fullMap) {
                fullMap.remove();
                fullMap = null;
            }

            const initialLat = tempLat ? parseFloat(tempLat.toString()) : defaultCenter[0];
            const initialLng = tempLng ? parseFloat(tempLng.toString()) : defaultCenter[1];
            const hasCoords = tempLat && tempLng;

            fullMap = L.map(fullMapElement, {
                zoomControl: true
            }).setView([initialLat, initialLng], hasCoords ? 16 : defaultZoom);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(fullMap);

            if (hasCoords) {
                fullMarker = L.marker([initialLat, initialLng], { draggable: true }).addTo(fullMap);
                setupMarkerDrag(fullMarker, true);
            }

            fullMap.on('click', (e: any) => {
                const { lat: newLat, lng: newLng } = e.latlng;
                setCoordinates(newLat, newLng, true);
            });

            setTimeout(() => fullMap?.invalidateSize(), 150);
            setTimeout(() => fullMap?.invalidateSize(), 400);
        }, 100);
    }

    function applyFullMapSelection() {
        lat = tempLat;
        lng = tempLng;
        if (tempAddress && !address) {
            address = tempAddress;
        }

        // Sync inline map
        if (map && lat && lng) {
            const pLat = parseFloat(lat.toString());
            const pLng = parseFloat(lng.toString());
            map.setView([pLat, pLng], 15);
            if (marker) {
                marker.setLatLng([pLat, pLng]);
            } else if (L) {
                marker = L.marker([pLat, pLng], { draggable: true }).addTo(map);
                setupMarkerDrag(marker, false);
            }
            setTimeout(() => map?.invalidateSize(), 100);
        }

        isFullModalOpen = false;
    }

    onDestroy(() => {
        if (resizeObserver) resizeObserver.disconnect();
        if (map) map.remove();
        if (fullMap) fullMap.remove();
    });
</script>

<div class="space-y-1.5">
    <!-- Search & Full Map Action Bar -->
    <div class="flex items-center gap-1.5">
        <div class="relative flex-1">
            <input
                type="text"
                bind:value={searchQuery}
                onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                placeholder="Cari lokasi / alamat (cth: Monas, Cakung)..."
                class="w-full h-8 pl-7 pr-2 rounded-md border border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Search class="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            {#if isSearching}
                <Loader2 class="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-primary" />
            {/if}
        </div>
        <button
            type="button"
            onclick={handleSearch}
            class="px-2.5 h-8 bg-muted hover:bg-muted/80 text-foreground border border-input rounded-md text-xs font-semibold flex items-center gap-1"
        >
            Cari
        </button>
        <button
            type="button"
            onclick={openFullMapModal}
            class="px-2.5 h-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs"
            title="Buka Peta Ukuran Penuh & Cari Lokasi"
        >
            <Maximize2 class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Peta Penuh</span>
        </button>
    </div>

    <!-- Inline Search Results Dropdown -->
    {#if searchResults.length > 0}
        <div class="border border-border rounded-lg bg-card shadow-lg overflow-hidden text-xs divide-y divide-border z-[1001] relative max-h-40 overflow-y-auto">
            {#each searchResults as res}
                <button
                    type="button"
                    onclick={() => selectSearchResult(res, false)}
                    class="w-full p-2 text-left hover:bg-primary/10 transition-colors flex items-start gap-1.5"
                >
                    <MapPin class="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span class="line-clamp-2 text-foreground font-medium">{res.display_name}</span>
                </button>
            {/each}
        </div>
    {/if}

    <!-- Inline Map Box -->
    <div
        bind:this={mapElement}
        class="w-full {height} rounded-lg border border-border shadow-xs z-0 relative overflow-hidden bg-muted/20"
    >
        {#if !lat || !lng}
            <div class="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1000] bg-background/95 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-medium text-muted-foreground shadow-sm border border-border pointer-events-none">
                Klik pada peta atau cari lokasi
            </div>
        {/if}
    </div>

    <!-- Coordinates Indicator -->
    <div class="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
        <div class="flex items-center gap-1">
            <span class="font-mono">Lat: <strong class="text-foreground">{lat || '-'}</strong></span>
            <span>&bull;</span>
            <span class="font-mono">Lng: <strong class="text-foreground">{lng || '-'}</strong></span>
        </div>
        {#if lat && lng}
            <span class="text-emerald-600 font-semibold flex items-center gap-0.5">
                <Check class="w-3 h-3" /> Titik Terpilih
            </span>
        {/if}
    </div>
</div>

<!-- Modal Peta Layar Penuh (Interactive Fullscreen Map Picker) -->
{#if isFullModalOpen}
    <div class="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
        <div class="bg-card border border-border rounded-2xl w-full max-w-4xl h-[90vh] max-h-[750px] flex flex-col overflow-hidden shadow-2xl">
            <!-- Modal Header -->
            <div class="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <MapPin class="w-4 h-4" />
                    </div>
                    <div>
                        <h3 class="font-bold text-sm text-foreground">{label} (Peta Penuh)</h3>
                        <p class="text-[11px] text-muted-foreground">Cari alamat atau klik & seret pin ke lokasi yang diinginkan</p>
                    </div>
                </div>
                <button
                    type="button"
                    onclick={() => isFullModalOpen = false}
                    class="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center text-xs font-bold"
                >
                    ✕
                </button>
            </div>

            <!-- Search bar in Full Modal -->
            <div class="p-3 border-b border-border bg-card shrink-0 space-y-2">
                <div class="flex items-center gap-2">
                    <div class="relative flex-1">
                        <input
                            type="text"
                            bind:value={searchQuery}
                            onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                            placeholder="Ketik nama tempat, jalan, atau gedung di Indonesia..."
                            class="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                        />
                        <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        {#if isSearching}
                            <Loader2 class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" />
                        {/if}
                    </div>
                    <button
                        type="button"
                        onclick={handleSearch}
                        class="px-4 h-10 bg-primary text-primary-foreground font-semibold rounded-lg text-xs hover:bg-primary/90 shadow-xs"
                    >
                        Cari Lokasi
                    </button>
                </div>

                {#if searchResults.length > 0}
                    <div class="border border-border rounded-lg bg-card shadow-lg overflow-hidden text-xs divide-y divide-border max-h-48 overflow-y-auto">
                        {#each searchResults as res}
                            <button
                                type="button"
                                onclick={() => selectSearchResult(res, true)}
                                class="w-full p-2.5 text-left hover:bg-primary/10 transition-colors flex items-start gap-2"
                            >
                                <MapPin class="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <div class="font-bold text-foreground">{res.display_name.split(',')[0]}</div>
                                    <div class="text-[11px] text-muted-foreground line-clamp-1">{res.display_name}</div>
                                </div>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Full Map Canvas -->
            <div class="flex-1 relative bg-muted/30">
                <div bind:this={fullMapElement} class="w-full h-full"></div>
            </div>

            <!-- Modal Footer -->
            <div class="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div class="text-xs">
                    <span class="text-muted-foreground">Koordinat Dipilih:</span>
                    <span class="font-mono font-bold text-foreground ml-1">
                        {tempLat || '-'}, {tempLng || '-'}
                    </span>
                    {#if tempAddress}
                        <div class="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            Alamat: {tempAddress}
                        </div>
                    {/if}
                </div>

                <div class="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onclick={() => isFullModalOpen = false}
                        class="px-4 py-2 border border-input bg-background hover:bg-muted text-foreground rounded-lg text-xs font-medium"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onclick={applyFullMapSelection}
                        disabled={!tempLat || !tempLng}
                        class="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:bg-primary/90 shadow-md disabled:opacity-50 flex items-center gap-1.5"
                    >
                        <Check class="w-4 h-4" />
                        <span>Gunakan Titik Ini</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    :global(.leaflet-container) {
        z-index: 0 !important;
        font-family: inherit;
    }
</style>
`;

fs.writeFileSync(mapPickerPath, mapPickerContent, 'utf8');
console.log('Successfully updated map-picker.svelte with Nominatim Search, Fullscreen Modal, and ResizeObserver!');

// 2. Update task-form.svelte to pass labels and address bindings
let taskFormContent = fs.readFileSync(taskFormPath, 'utf8');

// Ensure originAddress and destAddress state variables are bound
taskFormContent = taskFormContent.replace(
    '<MapPicker bind:lat={originLat} bind:lng={originLng} height="h-[180px]" />',
    '<MapPicker label="Titik Asal / Penjemputan" bind:lat={originLat} bind:lng={originLng} height="h-[160px]" />'
);

taskFormContent = taskFormContent.replace(
    '<MapPicker bind:lat={destLat} bind:lng={destLng} height="h-[180px]" />',
    '<MapPicker label="Titik Tujuan / Pengantaran" bind:lat={destLat} bind:lng={destLng} height="h-[160px]" />'
);

fs.writeFileSync(taskFormPath, taskFormContent, 'utf8');
console.log('Successfully updated task-form.svelte with improved MapPicker bindings!');
