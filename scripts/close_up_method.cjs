const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const migUnified = path.join(backendDir, 'database/migrations/2026_08_19_152052_create_hris_payroll_unified_tables.php');
let content = fs.readFileSync(migUnified, 'utf8');

// Insert closing bracket for up() method before docblock of down()
content = content.replace(
    `            Schema::create('hris_violations', function (Blueprint $table) {
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
        }`,
    `            Schema::create('hris_violations', function (Blueprint $table) {
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
        }
    }`
);

fs.writeFileSync(migUnified, content, 'utf8');
console.log('Closed up() method properly in unified migration!');
