const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

// 1. Update hris_news in 2026_08_19_152052_create_hris_payroll_unified_tables.php
const migUnified = path.join(backendDir, 'database/migrations/2026_08_19_152052_create_hris_payroll_unified_tables.php');
let uContent = fs.readFileSync(migUnified, 'utf8');

const startIdx = uContent.indexOf("if (!Schema::hasTable('hris_news')) {");
const endIdx = uContent.indexOf("});", startIdx) + 5;

const newNewsTable = `if (!Schema::hasTable('hris_news')) {
            Schema::create('hris_news', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('title', 200);
                $table->string('category', 50)->default('Announcement');
                $table->text('content');
                $table->string('banner_path')->nullable();
                $table->longText('banner_base64')->nullable();
                $table->enum('priority', ['normal', 'urgent'])->default('normal');
                $table->string('target_audience', 50)->default('all');
                $table->boolean('is_published')->default(false);
                $table->integer('views')->default(0);
                $table->dateTime('published_at')->nullable();
                $table->timestamps();

                $table->index('tenant_id');
            });
        }`;

uContent = uContent.slice(0, startIdx) + newNewsTable + uContent.slice(endIdx);
fs.writeFileSync(migUnified, uContent, 'utf8');

// 2. Update AdminHrisGovernanceAndComplianceTest.php with correct fields for training and contracts
const govCompTestPath = path.join(backendDir, 'tests/Feature/AdminHrisGovernanceAndComplianceTest.php');
const cleanGovCompTest = `<?php

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
            'trainer_name' => 'Pusat Pelatihan Keselamatan Transportasi',
            'training_date' => Carbon::today()->format('Y-m-d'),
            'location' => 'Training Center HQ',
            'duration_hours' => 8,
            'participant_ids' => [$this->employee->id],
        ]);
        $trainRes->assertStatus(201);
        $trainId = $trainRes->json('data.id') ?? $trainRes->json('id') ?? $trainRes->json('training.id');
        $this->assertNotNull($trainId);
    }

    public function test_contract_management()
    {
        $contractRes = $this->actingAs($this->admin)->postJson('/api/hris/contracts', [
            'employee_id' => $this->employee->id,
            'contract_type' => 'PKWT',
            'contract_date' => Carbon::today()->format('Y-m-d'),
            'start_date' => Carbon::today()->format('Y-m-d'),
            'end_date' => Carbon::today()->addYears(1)->format('Y-m-d'),
            'basic_salary' => 4500000,
        ]);
        $contractRes->assertStatus(201);

        $this->assertDatabaseHas('hris_contracts', [
            'employee_id' => $this->employee->id,
            'contract_type' => 'PKWT',
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
fs.writeFileSync(govCompTestPath, cleanGovCompTest, 'utf8');

console.log('Successfully aligned training, contract and news test payloads and schemas!');
