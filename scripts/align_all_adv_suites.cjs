const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

// 1. Update 2026_08_25_172100_create_hris_advanced_governance_tables.php
const advMigFile = path.join(backendDir, 'database/migrations/2026_08_25_172100_create_hris_advanced_governance_tables.php');
const comprehensiveMig = `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('hris_asset_categories')) {
            Schema::create('hris_asset_categories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->string('name', 100);
                $table->string('code', 50)->nullable();
                $table->text('description')->nullable();
                $table->timestamps();

                $table->index('tenant_id');
            });
        }

        if (!Schema::hasTable('hris_assets')) {
            Schema::create('hris_assets', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('category_id')->nullable()->constrained('hris_asset_categories')->nullOnDelete();
                $table->string('name', 150);
                $table->string('asset_code', 100)->nullable();
                $table->string('serial_number', 100)->nullable();
                $table->date('purchase_date')->nullable();
                $table->decimal('purchase_price', 15, 2)->default(0);
                $table->string('status', 50)->default('available');
                $table->foreignId('assigned_to')->nullable()->constrained('employees')->nullOnDelete();
                $table->date('assigned_date')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('tenant_id');
            });
        }

        if (!Schema::hasTable('hris_news')) {
            Schema::create('hris_news', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->string('title', 200);
                $table->string('category', 50)->default('general');
                $table->text('content');
                $table->string('banner_path')->nullable();
                $table->boolean('is_published')->default(false);
                $table->dateTime('published_at')->nullable();
                $table->integer('views_count')->default(0);
                $table->timestamps();

                $table->index('tenant_id');
            });
        }

        if (!Schema::hasTable('hris_kpi_periods')) {
            Schema::create('hris_kpi_periods', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->string('name', 100);
                $table->string('period_type', 50)->default('quarterly');
                $table->date('start_date');
                $table->date('end_date');
                $table->string('status', 20)->default('active');
                $table->text('description')->nullable();
                $table->timestamps();

                $table->index('tenant_id');
            });
        }

        if (!Schema::hasTable('hris_performance_reviews')) {
            Schema::create('hris_performance_reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->string('target_type', 50)->default('employee');
                $table->foreignId('employee_id')->nullable()->constrained('employees')->onDelete('cascade');
                $table->string('department', 100)->nullable();
                $table->string('period', 50);
                $table->foreignId('period_id')->nullable()->constrained('hris_kpi_periods')->nullOnDelete();
                $table->decimal('attendance_score', 5, 2)->default(5);
                $table->decimal('task_completion_score', 5, 2)->default(5);
                $table->decimal('discipline_score', 5, 2)->default(5);
                $table->decimal('teamwork_score', 5, 2)->default(5);
                $table->decimal('score', 5, 2)->default(0);
                $table->string('grade', 10)->nullable();
                $table->text('feedback')->nullable();
                $table->text('remarks')->nullable();
                $table->string('status', 20)->default('draft');
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['tenant_id', 'employee_id']);
            });
        }

        if (!Schema::hasTable('hris_mutations')) {
            Schema::create('hris_mutations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
                $table->string('mutation_number', 100)->nullable();
                $table->string('mutation_type', 50)->default('promotion');
                $table->date('effective_date');
                $table->string('old_department', 100)->nullable();
                $table->string('new_department', 100)->nullable();
                $table->string('old_position', 100)->nullable();
                $table->string('new_position', 100)->nullable();
                $table->string('old_employment_status', 100)->nullable();
                $table->string('new_employment_status', 100)->nullable();
                $table->text('reason')->nullable();
                $table->string('document_sk_path')->nullable();
                $table->string('document_sk_name')->nullable();
                $table->string('status', 50)->default('approved');
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index('tenant_id');
            });
        }

        if (!Schema::hasTable('hris_trainings')) {
            Schema::create('hris_trainings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->string('title', 200);
                $table->string('provider', 150)->nullable();
                $table->date('start_date');
                $table->date('end_date');
                $table->decimal('cost', 15, 2)->default(0);
                $table->string('location', 200)->nullable();
                $table->string('status', 20)->default('scheduled');
                $table->timestamps();

                $table->index('tenant_id');
            });
        }

        if (!Schema::hasTable('hris_training_participants')) {
            Schema::create('hris_training_participants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('training_id')->constrained('hris_trainings')->onDelete('cascade');
                $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
                $table->string('status', 20)->default('enrolled');
                $table->decimal('score', 5, 2)->nullable();
                $table->string('certificate_number', 100)->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('hris_contracts')) {
            Schema::create('hris_contracts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
                $table->string('contract_number', 100);
                $table->string('contract_type', 50)->default('PKWT');
                $table->date('start_date');
                $table->date('end_date');
                $table->string('status', 20)->default('active');
                $table->timestamps();

                $table->index(['tenant_id', 'employee_id']);
            });
        }

        if (!Schema::hasTable('hris_documents')) {
            Schema::create('hris_documents', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
                $table->string('title', 150)->nullable();
                $table->string('name', 150)->nullable();
                $table->string('category', 50)->default('general');
                $table->string('document_type', 50)->nullable();
                $table->string('document_number', 100)->nullable();
                $table->string('file_path')->nullable();
                $table->string('file_name')->nullable();
                $table->string('file_type')->nullable();
                $table->string('status', 20)->default('verified');
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('tenant_id');
            });
        }

        if (!Schema::hasTable('hris_violations')) {
            Schema::create('hris_violations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
                $table->string('violation_type', 50);
                $table->date('violation_date');
                $table->date('valid_from');
                $table->date('valid_until')->nullable();
                $table->text('description');
                $table->string('sanction', 100)->nullable();
                $table->string('status', 20)->default('active');
                $table->timestamps();

                $table->index('tenant_id');
            });
        }

        if (!Schema::hasTable('hris_resignations')) {
            Schema::create('hris_resignations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
                $table->string('resignation_number', 100)->nullable();
                $table->string('category', 50)->default('voluntary');
                $table->date('resignation_date');
                $table->date('effective_date')->nullable();
                $table->text('reason')->nullable();
                $table->string('status', 20)->default('approved');
                $table->timestamps();

                $table->index('tenant_id');
            });
        }

        if (!Schema::hasTable('hris_compliance_doc_types')) {
            Schema::create('hris_compliance_doc_types', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->string('name', 100);
                $table->string('category', 50)->default('employee');
                $table->timestamps();

                $table->index('tenant_id');
            });
        }

        if (!Schema::hasTable('hris_compliance_items')) {
            Schema::create('hris_compliance_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->string('target_type', 50)->default('employee');
                $table->integer('target_id')->default(1);
                $table->string('doc_name', 150);
                $table->string('doc_number', 100)->nullable();
                $table->date('expiry_date');
                $table->integer('reminder_days_before')->default(30);
                $table->string('document_path')->nullable();
                $table->string('document_name')->nullable();
                $table->string('status', 20)->default('valid');
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('tenant_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('hris_compliance_items');
        Schema::dropIfExists('hris_compliance_doc_types');
        Schema::dropIfExists('hris_resignations');
        Schema::dropIfExists('hris_violations');
        Schema::dropIfExists('hris_documents');
        Schema::dropIfExists('hris_contracts');
        Schema::dropIfExists('hris_training_participants');
        Schema::dropIfExists('hris_trainings');
        Schema::dropIfExists('hris_mutations');
        Schema::dropIfExists('hris_performance_reviews');
        Schema::dropIfExists('hris_kpi_periods');
        Schema::dropIfExists('hris_news');
        Schema::dropIfExists('hris_assets');
        Schema::dropIfExists('hris_asset_categories');
    }
};
`;
fs.writeFileSync(advMigFile, comprehensiveMig, 'utf8');

// 2. Update AdminHrisRequestsAndShiftsTest.php
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
            'check_in_start' => '06:00',
            'work_start_time' => '07:00',
            'late_tolerance_time' => '07:15',
            'check_in_end' => '08:00',
            'work_end_time' => '15:00',
            'color' => '#10B981',
        ]);
        $shiftRes->assertStatus(201);
        $shiftId = $shiftRes->json('data.id') ?? $shiftRes->json('id');

        // 2. Assign Shift to Employee
        $assignRes = $this->actingAs($this->admin)->postJson('/api/hris/shift-assignments', [
            'employee_ids' => [$this->employee->id],
            'shift_id' => (int)$shiftId,
            'start_date' => Carbon::today()->format('Y-m-d'),
            'end_date' => Carbon::today()->addDays(2)->format('Y-m-d'),
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

// 3. Update AdminHrisPerformanceAndMutationsTest.php
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
        $revRes = $this->actingAs($this->admin)->postJson('/api/hris/performance', [
            'target_type' => 'employee',
            'employee_id' => $this->employee->id,
            'period' => '2026-Q3',
            'attendance_score' => 4.8,
            'task_completion_score' => 4.9,
            'discipline_score' => 4.7,
            'teamwork_score' => 5.0,
            'remarks' => 'Kinerja luar biasa dalam pencapaian target penjualan.',
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
            'mutation_type' => 'promotion',
            'effective_date' => Carbon::today()->format('Y-m-d'),
            'new_department' => 'Marketing',
            'new_position' => 'Senior Officer',
            'reason' => 'Promosi jabatan atas pencapaian kinerja Q3',
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

// 4. Update AdminHrisGovernanceAndComplianceTest.php
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
            'title' => 'KTP Elektronik Karyawan',
            'category' => 'identity',
            'notes' => 'KTP Asli telah diverifikasi',
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
            'violation_date' => Carbon::today()->format('Y-m-d'),
            'valid_from' => Carbon::today()->format('Y-m-d'),
            'valid_until' => Carbon::today()->addMonths(6)->format('Y-m-d'),
            'description' => 'Terlambat berulang tanpa keterangan yang sah',
            'sanction' => 'Surat Peringatan Pertama',
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
            'category' => 'voluntary',
            'resignation_date' => Carbon::today()->format('Y-m-d'),
            'reason' => 'Pindah domisili luar pulau',
        ]);
        $resRes->assertStatus(201);

        $this->assertDatabaseHas('hris_resignations', [
            'employee_id' => $this->employee->id,
            'status' => 'approved',
        ]);
    }

    public function test_compliance_and_legal_license_alerts()
    {
        $compRes = $this->actingAs($this->admin)->postJson('/api/hris/compliance', [
            'target_type' => 'employee',
            'target_id' => $this->employee->id,
            'doc_name' => 'SIM B1 Pengemudi Truk',
            'doc_number' => 'SIM-99281726',
            'expiry_date' => Carbon::today()->addMonths(3)->format('Y-m-d'),
        ]);
        $compRes->assertStatus(201);

        $summaryRes = $this->actingAs($this->admin)->getJson('/api/hris/compliance/summary');
        $summaryRes->assertStatus(200);
    }
}
`;
fs.writeFileSync(path.join(backendDir, 'tests/Feature/AdminHrisGovernanceAndComplianceTest.php'), govCompTest, 'utf8');

console.log('Successfully aligned all 4 suites and governance migrations!');
