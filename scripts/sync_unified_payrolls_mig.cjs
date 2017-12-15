const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

// 1. Inspect 2026_08_19_152052_create_hris_payroll_unified_tables.php
const unifiedMig = path.join(backendDir, 'database/migrations/2026_08_19_152052_create_hris_payroll_unified_tables.php');
let content = fs.readFileSync(unifiedMig, 'utf8');

// Replace the old definition of hris_payrolls and hris_payroll_items with actual real schema
const oldPayrolls = `        if (!Schema::hasTable('hris_payrolls')) {
            Schema::create('hris_payrolls', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->string('batch_code', 50)->unique();
                $table->string('batch_name', 150);
                $table->enum('type', ['monthly', 'daily'])->default('monthly');
                $table->integer('month')->nullable();
                $table->integer('year');
                $table->date('period_start');
                $table->date('period_end');
                $table->date('pay_date')->nullable();
                $table->integer('total_recipients')->default(0);
                $table->decimal('total_amount', 15, 2)->default(0);
                $table->enum('status', ['draft', 'published'])->default('draft');
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
                $table->timestamps();
            });
        }`;

const newPayrolls = `        if (!Schema::hasTable('hris_payrolls')) {
            Schema::create('hris_payrolls', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained('users')->onDelete('cascade');
                $table->string('payroll_type', 50)->default('monthly');
                $table->string('code', 50)->nullable();
                $table->string('batch_name', 150)->nullable();
                $table->integer('month')->nullable();
                $table->integer('year')->nullable();
                $table->date('slip_date')->nullable();
                $table->date('period_start')->nullable();
                $table->date('period_end')->nullable();
                $table->decimal('total_amount', 15, 2)->default(0);
                $table->string('status', 30)->default('draft');
                $table->string('report_file_path', 255)->nullable();
                $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }`;

content = content.replace(oldPayrolls, newPayrolls);
fs.writeFileSync(unifiedMig, content, 'utf8');

// Also remove check_mysql_schema.php
const chk = path.join(backendDir, 'check_mysql_schema.php');
if (fs.existsSync(chk)) fs.unlinkSync(chk);

console.log('Synchronized 2026_08_19_152052_create_hris_payroll_unified_tables.php with exact MySQL schema!');
