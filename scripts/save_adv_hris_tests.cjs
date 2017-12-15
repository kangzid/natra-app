const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

// 1. Inspect and align AdminHrisRequestsAndShiftsTest.php
const reqShiftTest = `<?php

namespace Tests\\Feature;

use Tests\\TestCase;
use App\\Models\\User;
use App\\Models\\Employee;
use App\\Models\\HrisShift;
use App\\Models\\HrisShiftAssignment;
use App\\Models\\HrisRequest;
use Carbon\\Carbon;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;

class AdminHrisRequestsAndShiftsTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $employee;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $empUser = User::factory()->create(['role' => 'employee', 'admin_id' => $this->admin->id]);
        $this->employee = Employee::create([
            'user_id' => $empUser->id,
            'admin_id' => $this->admin->id,
            'employee_id' => 'EMP-RS1',
            'department' => 'Operations',
            'position' => 'Staff',
            'is_active' => true,
        ]);
    }

    public function test_shift_management_and_assignment()
    {
        // 1. Create Shift
        $shiftRes = $this->actingAs($this->admin)->postJson('/api/hris/shifts', [
            'name' => 'Shift Pagi Operasional',
            'code' => 'SP-01',
            'start_time' => '07:00',
            'end_time' => '15:00',
            'color' => '#10B981',
        ]);
        $shiftRes->assertStatus(201);
        $shiftId = $shiftRes->json('data.id') ?? $shiftRes->json('id');

        // 2. Assign Shift to Employee
        $assignRes = $this->actingAs($this->admin)->postJson('/api/hris/shift-assignments', [
            'employee_id' => $this->employee->id,
            'shift_id' => $shiftId,
            'start_date' => Carbon::today()->format('Y-m-d'),
            'end_date' => Carbon::today()->addDays(6)->format('Y-m-d'),
        ]);
        $assignRes->assertStatus(200);

        $getRes = $this->actingAs($this->admin)->getJson('/api/hris/shift-assignments');
        $getRes->assertStatus(200);
    }

    public function test_leave_and_permission_request_lifecycle()
    {
        $payload = [
            'employee_id' => $this->employee->id,
            'request_type' => 'leave',
            'start_date' => Carbon::today()->format('Y-m-d'),
            'end_date' => Carbon::today()->addDays(2)->format('Y-m-d'),
            'reason' => 'Cuti tahunan keperluan keluarga',
        ];

        // 1. Submit Request
        $createRes = $this->actingAs($this->employee->user)->postJson('/api/hris/requests', $payload);
        $createRes->assertStatus(201);
        $reqId = $createRes->json('data.id') ?? $createRes->json('id');

        // 2. Admin Approves Request
        $appRes = $this->actingAs($this->admin)->postJson("/api/hris/requests/{$reqId}/approve");
        $appRes->assertStatus(200);

        $this->assertDatabaseHas('hris_requests', [
            'id' => $reqId,
            'status' => 'approved',
        ]);
    }
}
`;
fs.writeFileSync(path.join(backendDir, 'tests/Feature/AdminHrisRequestsAndShiftsTest.php'), reqShiftTest, 'utf8');

// 2. Inspect and align AdminHrisAssetsAndNewsTest.php
const assetNewsTest = `<?php

namespace Tests\\Feature;

use Tests\\TestCase;
use App\\Models\\User;
use App\\Models\\Employee;
use App\\Models\\HrisAssetCategory;
use App\\Models\\HrisAsset;
use App\\Models\\HrisNews;
use Carbon\\Carbon;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;

class AdminHrisAssetsAndNewsTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $employee;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $empUser = User::factory()->create(['role' => 'employee', 'admin_id' => $this->admin->id]);
        $this->employee = Employee::create([
            'user_id' => $empUser->id,
            'admin_id' => $this->admin->id,
            'employee_id' => 'EMP-AN1',
            'department' => 'IT Support',
            'position' => 'Staff',
            'is_active' => true,
        ]);
    }

    public function test_asset_inventory_management_and_handover()
    {
        $catRes = $this->actingAs($this->admin)->postJson('/api/hris/asset-categories', [
            'name' => 'Elektronik Laptop',
            'code' => 'LAPTOP',
        ]);
        $catRes->assertStatus(201);
        $catId = $catRes->json('data.id') ?? $catRes->json('id');

        $assetRes = $this->actingAs($this->admin)->postJson('/api/hris/assets', [
            'category_id' => $catId,
            'name' => 'MacBook Air M2 Silver',
            'asset_code' => 'AST-LAP-001',
            'serial_number' => 'SN99283711',
            'purchase_date' => Carbon::today()->format('Y-m-d'),
            'purchase_price' => 17500000,
            'status' => 'available',
        ]);
        $assetRes->assertStatus(201);
        $assetId = $assetRes->json('data.id') ?? $assetRes->json('id');

        $handoverRes = $this->actingAs($this->admin)->postJson("/api/hris/assets/{$assetId}/assign", [
            'employee_id' => $this->employee->id,
            'assigned_date' => Carbon::today()->format('Y-m-d'),
            'notes' => 'Penyerahan laptop kerja operasional',
        ]);
        $handoverRes->assertStatus(200);

        $this->assertDatabaseHas('hris_assets', [
            'id' => $assetId,
            'assigned_to' => $this->employee->id,
            'status' => 'in_use',
        ]);
    }

    public function test_news_and_announcement_publishing()
    {
        $newsRes = $this->actingAs($this->admin)->postJson('/api/hris/news', [
            'title' => 'Pengumuman Libur Hari Raya Perusahaan',
            'category' => 'company_announcement',
            'content' => 'Diberitahukan kepada seluruh staf bahwa operasional libur bersama nasional.',
            'is_published' => true,
            'published_at' => Carbon::today()->format('Y-m-d H:i:s'),
        ]);
        $newsRes->assertStatus(201);
        $newsId = $newsRes->json('data.id') ?? $newsRes->json('id');

        $listRes = $this->actingAs($this->admin)->getJson('/api/hris/news');
        $listRes->assertStatus(200);

        $viewRes = $this->actingAs($this->employee->user)->postJson("/api/hris/news/{$newsId}/view");
        $viewRes->assertStatus(200);
    }
}
`;
fs.writeFileSync(path.join(backendDir, 'tests/Feature/AdminHrisAssetsAndNewsTest.php'), assetNewsTest, 'utf8');

// 3. Inspect and align AdminHrisPerformanceAndMutationsTest.php
const perfMutTest = `<?php

namespace Tests\\Feature;

use Tests\\TestCase;
use App\\Models\\User;
use App\\Models\\Employee;
use App\\Models\\HrisKpiPeriod;
use App\\Models\\HrisPerformanceReview;
use App\\Models\\HrisMutation;
use Carbon\\Carbon;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;

class AdminHrisPerformanceAndMutationsTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $employee;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $empUser = User::factory()->create(['role' => 'employee', 'admin_id' => $this->admin->id]);
        $this->employee = Employee::create([
            'user_id' => $empUser->id,
            'admin_id' => $this->admin->id,
            'employee_id' => 'EMP-PM1',
            'department' => 'Marketing',
            'position' => 'Junior Officer',
            'is_active' => true,
        ]);
    }

    public function test_kpi_performance_review_lifecycle()
    {
        $periodRes = $this->actingAs($this->admin)->postJson('/api/hris/kpi-periods', [
            'name' => 'KPI Q3 2026',
            'start_date' => Carbon::today()->startOfQuarter()->format('Y-m-d'),
            'end_date' => Carbon::today()->endOfQuarter()->format('Y-m-d'),
            'status' => 'active',
        ]);
        $periodRes->assertStatus(201);
        $periodId = $periodRes->json('data.id') ?? $periodRes->json('id');

        $revRes = $this->actingAs($this->admin)->postJson('/api/hris/performance', [
            'employee_id' => $this->employee->id,
            'period_id' => $periodId,
            'score' => 92.5,
            'grade' => 'A',
            'feedback' => 'Kinerja luar biasa dalam pencapaian target penjualan.',
        ]);
        $revRes->assertStatus(201);
        $revId = $revRes->json('data.id') ?? $revRes->json('id');

        $finRes = $this->actingAs($this->admin)->postJson("/api/hris/performance/{$revId}/finalize");
        $finRes->assertStatus(200);

        $this->assertDatabaseHas('hris_performance_reviews', [
            'id' => $revId,
            'status' => 'finalized',
        ]);
    }

    public function test_employee_mutation_and_promotion()
    {
        $mutRes = $this->actingAs($this->admin)->postJson('/api/hris/mutations', [
            'employee_id' => $this->employee->id,
            'type' => 'promotion',
            'effective_date' => Carbon::today()->format('Y-m-d'),
            'previous_department' => 'Marketing',
            'new_department' => 'Marketing',
            'previous_position' => 'Junior Officer',
            'new_position' => 'Senior Officer',
            'notes' => 'Promosi jabatan atas pencapaian kinerja Q3',
        ]);
        $mutRes->assertStatus(201);
        $mutId = $mutRes->json('data.id') ?? $mutRes->json('id');

        $this->assertDatabaseHas('hris_mutations', [
            'id' => $mutId,
            'new_position' => 'Senior Officer',
        ]);
    }
}
`;
fs.writeFileSync(path.join(backendDir, 'tests/Feature/AdminHrisPerformanceAndMutationsTest.php'), perfMutTest, 'utf8');

// 4. Inspect and align AdminHrisGovernanceAndComplianceTest.php
const govCompTest = `<?php

namespace Tests\\Feature;

use Tests\\TestCase;
use App\\Models\\User;
use App\\Models\\Employee;
use App\\Models\\HrisTraining;
use App\\Models\\HrisContract;
use App\\Models\\HrisDocument;
use App\\Models\\HrisViolation;
use App\\Models\\HrisResignation;
use App\\Models\\HrisComplianceItem;
use App\\Models\\HrisComplianceDocType;
use Carbon\\Carbon;
use Illuminate\\Foundation\\Testing\\RefreshDatabase;

class AdminHrisGovernanceAndComplianceTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $employee;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $empUser = User::factory()->create(['role' => 'employee', 'admin_id' => $this->admin->id]);
        $this->employee = Employee::create([
            'user_id' => $empUser->id,
            'admin_id' => $this->admin->id,
            'employee_id' => 'EMP-GC1',
            'department' => 'Logistics',
            'position' => 'Driver Operasional',
            'is_active' => true,
        ]);
    }

    public function test_training_and_certification_program()
    {
        $trainRes = $this->actingAs($this->admin)->postJson('/api/hris/training', [
            'title' => 'Sertifikasi Defensive Driving Driver',
            'provider' => 'Pusat Pelatihan Keselamatan Transportasi',
            'start_date' => Carbon::today()->format('Y-m-d'),
            'end_date' => Carbon::today()->addDays(3)->format('Y-m-d'),
            'cost' => 1500000,
            'location' => 'Training Center HQ',
        ]);
        $trainRes->assertStatus(201);
        $trainId = $trainRes->json('data.id') ?? $trainRes->json('id');

        $partRes = $this->actingAs($this->admin)->postJson("/api/hris/training/{$trainId}/participants", [
            'employee_ids' => [$this->employee->id],
        ]);
        $partRes->assertStatus(200);
    }

    public function test_contract_management()
    {
        $contractRes = $this->actingAs($this->admin)->postJson('/api/hris/contracts', [
            'employee_id' => $this->employee->id,
            'contract_number' => 'CTR/LOG/2026/001',
            'contract_type' => 'PKWT',
            'start_date' => Carbon::today()->format('Y-m-d'),
            'end_date' => Carbon::today()->addYears(1)->format('Y-m-d'),
            'status' => 'active',
        ]);
        $contractRes->assertStatus(201);

        $this->assertDatabaseHas('hris_contracts', [
            'contract_number' => 'CTR/LOG/2026/001',
            'employee_id' => $this->employee->id,
        ]);
    }

    public function test_document_vault_and_verification()
    {
        $docRes = $this->actingAs($this->admin)->postJson('/api/hris/documents', [
            'employee_id' => $this->employee->id,
            'name' => 'KTP Elektronik Karyawan',
            'document_type' => 'identity',
            'document_number' => '3273019283710001',
            'status' => 'verified',
        ]);
        $docRes->assertStatus(201);

        $docId = $docRes->json('data.id') ?? $docRes->json('id');
        $this->assertNotNull($docId);
    }

    public function test_violation_and_warning_letter_sp()
    {
        $spRes = $this->actingAs($this->admin)->postJson('/api/hris/violations', [
            'employee_id' => $this->employee->id,
            'violation_type' => 'SP1',
            'incident_date' => Carbon::today()->format('Y-m-d'),
            'description' => 'Terlambat berulang tanpa keterangan yang sah',
            'sanction' => 'Surat Peringatan Pertama',
            'valid_until' => Carbon::today()->addMonths(6)->format('Y-m-d'),
        ]);
        $spRes->assertStatus(201);

        $this->assertDatabaseHas('hris_violations', [
            'employee_id' => $this->employee->id,
            'violation_type' => 'SP1',
        ]);
    }

    public function test_employee_resignation_lifecycle()
    {
        $resRes = $this->actingAs($this->admin)->postJson('/api/hris/resignations', [
            'employee_id' => $this->employee->id,
            'submission_date' => Carbon::today()->format('Y-m-d'),
            'effective_date' => Carbon::today()->addMonth()->format('Y-m-d'),
            'reason' => 'Pindah domisili luar pulau',
            'status' => 'approved',
        ]);
        $resRes->assertStatus(201);

        $this->assertDatabaseHas('hris_resignations', [
            'employee_id' => $this->employee->id,
            'status' => 'approved',
        ]);
    }

    public function test_compliance_and_legal_license_alerts()
    {
        // 1. Create Doc Type
        $docTypeRes = $this->actingAs($this->admin)->postJson('/api/hris/compliance-doc-types', [
            'name' => 'SIM B1 Pengemudi Truk',
            'category' => 'employee',
        ]);
        $docTypeRes->assertStatus(201);
        $typeId = $docTypeRes->json('data.id') ?? $docTypeRes->json('id');

        // 2. Create Compliance Item
        $compRes = $this->actingAs($this->admin)->postJson('/api/hris/compliance', [
            'doc_type_id' => $typeId,
            'entity_type' => 'employee',
            'employee_id' => $this->employee->id,
            'document_number' => 'SIM-99281726',
            'expiry_date' => Carbon::today()->addMonths(3)->format('Y-m-d'),
            'status' => 'valid',
        ]);
        $compRes->assertStatus(201);

        $summaryRes = $this->actingAs($this->admin)->getJson('/api/hris/compliance/summary');
        $summaryRes->assertStatus(200);
    }
}
`;
fs.writeFileSync(path.join(backendDir, 'tests/Feature/AdminHrisGovernanceAndComplianceTest.php'), govCompTest, 'utf8');

console.log('Saved all 4 test suites for advanced HRIS modules!');
