const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const migUnified = path.join(backendDir, 'database/migrations/2026_08_19_152052_create_hris_payroll_unified_tables.php');
let content = fs.readFileSync(migUnified, 'utf8');

const startIdx = content.indexOf("if (!Schema::hasTable('hris_violations')) {");
const endIdx = content.indexOf("});", startIdx) + 5;

const newTable = `if (!Schema::hasTable('hris_violations')) {
            Schema::create('hris_violations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
                $table->string('document_number', 100)->nullable();
                $table->string('contract_number', 100)->nullable();
                $table->string('violation_type', 50);
                $table->date('violation_date');
                $table->date('valid_from')->nullable();
                $table->date('valid_until')->nullable();
                $table->text('description');
                $table->integer('violation_points')->nullable();
                $table->string('legal_basis', 200)->nullable();
                $table->string('sanction', 100)->nullable();
                $table->string('evidence_path')->nullable();
                $table->string('evidence_name')->nullable();
                $table->string('status', 20)->default('active');
                $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('tenant_id');
            });
        }`;

content = content.slice(0, startIdx) + newTable + content.slice(endIdx);
fs.writeFileSync(migUnified, content, 'utf8');
console.log('Precisely updated hris_violations table in unified migration!');
