const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const migUnified = path.join(backendDir, 'database/migrations/2026_08_19_152052_create_hris_payroll_unified_tables.php');
let content = fs.readFileSync(migUnified, 'utf8');

const targetStr = `                $table->index('tenant_id');
            });
        }

    /**
     * Reverse the migrations.`;

const replacementStr = `                $table->index('tenant_id');
            });
        }
    }

    /**
     * Reverse the migrations.`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(migUnified, content, 'utf8');
console.log('Explicitly closed up() method block before Reverse the migrations docblock!');
