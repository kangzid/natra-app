const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const migUnified = path.join(backendDir, 'database/migrations/2026_08_19_152052_create_hris_payroll_unified_tables.php');
let content = fs.readFileSync(migUnified, 'utf8');

const startIdx = content.indexOf("if (!Schema::hasTable('hris_compliance_items')) {");
const endIdx = content.indexOf("});", startIdx) + 5;

const newTable = `if (!Schema::hasTable('hris_compliance_items')) {
            Schema::create('hris_compliance_items', function (Blueprint $table) {
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
            });
        }`;

content = content.slice(0, startIdx) + newTable + content.slice(endIdx);
fs.writeFileSync(migUnified, content, 'utf8');
console.log('Precisely updated hris_compliance_items table in unified migration!');
