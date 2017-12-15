const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

// 1. Update 2026_08_25_172100_create_hris_advanced_governance_tables.php with period_type and mutation_type
const advMigFile = path.join(backendDir, 'database/migrations/2026_08_25_172100_create_hris_advanced_governance_tables.php');
let migContent = fs.readFileSync(advMigFile, 'utf8');

migContent = migContent.replace(
    "$table->string('name', 100);",
    "$table->string('name', 100);\n                $table->string('period_type', 50)->default('quarterly');\n                $table->text('description')->nullable();"
);

migContent = migContent.replace(
    "$table->string('type', 50)->default('mutation');",
    "$table->string('type', 50)->default('mutation');\n                $table->string('mutation_type', 50)->default('promotion');"
);

fs.writeFileSync(advMigFile, migContent, 'utf8');

// 2. Update AdminHrisRequestsAndShiftsTest.php with shift parameters
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
            'assignments' => [
                [
                    'employee_id' => $this->employee->id,
                    'shift_id' => $shiftId,
                    'date' => Carbon::today()->format('Y-m-d'),
                ]
            ]
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

// 3. Update AdminHrisPerformanceAndMutationsTest.php with mutation_type
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
            'mutation_type' => 'promotion',
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

console.log('Synchronized migration and shift/mutation tests!');
