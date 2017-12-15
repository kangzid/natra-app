const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const migUnified = path.join(backendDir, 'database/migrations/2026_08_19_152052_create_hris_payroll_unified_tables.php');
let content = fs.readFileSync(migUnified, 'utf8');

// Insert closing bracket for up() right before docblock `    /**` of down()
content = content.replace(
    `                $table->index('tenant_id');
            });
        }

    /**
     * Reverse the migrations.`,
    `                $table->index('tenant_id');
            });
        }
    }

    /**
     * Reverse the migrations.`
);

fs.writeFileSync(migUnified, content, 'utf8');
console.log('Inserted missing closing bracket for up() method!');
