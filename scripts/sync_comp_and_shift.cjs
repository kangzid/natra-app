const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

// 1. Inspect and update hris_compliance_items in 2026_08_19_152052_create_hris_payroll_unified_tables.php
const migUnified = path.join(backendDir, 'database/migrations/2026_08_19_152052_create_hris_payroll_unified_tables.php');
let uContent = fs.readFileSync(migUnified, 'utf8');

const idx = uContent.indexOf("create('hris_compliance_items'");
if (idx !== -1) {
    console.log('=== In 2026_08_19_152052_create_hris_payroll_unified_tables.php ===\n', uContent.slice(idx, idx + 500));
}

// Ensure document_path, doc_name, doc_number, target_type, target_id are present in unified table
const oldUnifiedComp = `            Schema::create('hris_compliance_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('doc_type_id')->nullable()->constrained('hris_compliance_doc_types')->nullOnDelete();
                $table->string('entity_type', 50)->default('employee');
                $table->foreignId('employee_id')->nullable()->constrained('employees')->nullOnDelete();
                $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
                $table->string('document_number', 100)->nullable();
                $table->date('expiry_date')->nullable();
                $table->string('status', 20)->default('valid');
                $table->timestamps();

                $table->index('tenant_id');
            });`;

const newUnifiedComp = `            Schema::create('hris_compliance_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->string('target_type', 50)->default('employee');
                $table->integer('target_id')->default(1);
                $table->string('doc_name', 150)->nullable();
                $table->string('doc_number', 100)->nullable();
                $table->date('expiry_date');
                $table->integer('reminder_days_before')->default(30);
                $table->string('document_path')->nullable();
                $table->string('document_name')->nullable();
                $table->string('status', 20)->default('safe');
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('tenant_id');
            });`;

uContent = uContent.replace(oldUnifiedComp, newUnifiedComp);
fs.writeFileSync(migUnified, uContent, 'utf8');

// 2. Update AdminHrisRequestsAndShiftsTest.php to extract shift.id
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
        $shiftId = $shiftRes->json('shift.id') ?? $shiftRes->json('data.id') ?? $shiftRes->json('id');
        $this->assertNotNull($shiftId);

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

console.log('Synchronized unified compliance table and shift assignment extraction!');
