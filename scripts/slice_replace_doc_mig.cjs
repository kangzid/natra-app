const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const migUnified = path.join(backendDir, 'database/migrations/2026_08_19_152052_create_hris_payroll_unified_tables.php');
let content = fs.readFileSync(migUnified, 'utf8');

const startIdx = content.indexOf("if (!Schema::hasTable('hris_documents')) {");
const endIdx = content.indexOf("});", startIdx) + 5;

const newTable = `if (!Schema::hasTable('hris_documents')) {
            Schema::create('hris_documents', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
                $table->string('title', 150);
                $table->string('category', 50)->default('general');
                $table->string('document_name', 255)->nullable();
                $table->string('document_path')->nullable();
                $table->string('file_name', 255)->nullable();
                $table->string('file_type', 50)->nullable();
                $table->integer('file_size_kb')->default(0);
                $table->string('physical_location', 255)->nullable();
                $table->boolean('is_original_stored')->default(false);
                $table->boolean('is_verified')->default(false);
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('tenant_id');
            });
        }`;

content = content.slice(0, startIdx) + newTable + content.slice(endIdx);
fs.writeFileSync(migUnified, content, 'utf8');
console.log('Precisely updated hris_documents table in unified migration!');
