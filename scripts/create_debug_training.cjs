const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const testScript = `<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\User;
use App\\Models\\HrisTraining;
use App\\Models\\HrisTrainingParticipant;
use Illuminate\\Http\\Request;

$admin = User::where('email', 'admin@majusejahtera.com')->first();
echo "Admin ID: {$admin->id}\\n";

echo "All HrisTraining in DB count: " . HrisTraining::count() . "\\n";
foreach (HrisTraining::with('participants')->get() as $t) {
    echo "- ID: {$t->id}, Tenant: {$t->tenant_id}, Title: {$t->title}, Date: {$t->date}, Participants: " . $t->participants->count() . "\\n";
}

echo "\\nAll HrisTrainingParticipant count: " . HrisTrainingParticipant::count() . "\\n";
foreach (HrisTrainingParticipant::with('employee.user')->get() as $p) {
    $empName = $p->employee && $p->employee->user ? $p->employee->user->name : 'N/A';
    echo "- Part ID: {$p->id}, Training ID: {$p->training_id}, Emp ID: {$p->employee_id} ($empName), Status: {$p->status}\\n";
}

$trainingCtrl = app(App\\Http\\Controllers\\Api\\HrisTrainingController::class);
$req = Request::create('/api/hris/training', 'GET');
$req->setUserResolver(fn() => $admin);
$res = $trainingCtrl->index($req);

echo "\\nAPI Response /api/hris/training status: " . $res->getStatusCode() . "\\n";
echo "Content: " . $res->getContent() . "\\n";
`;

fs.writeFileSync(path.join(backendDir, 'debug_training.php'), testScript, 'utf8');
