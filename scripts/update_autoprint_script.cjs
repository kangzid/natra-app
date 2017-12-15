const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const ctrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisPayrollController.php');
let content = fs.readFileSync(ctrlPath, 'utf8');

const autoPrintScript = `    <script>
        window.addEventListener('DOMContentLoaded', function() {
            var params = new URLSearchParams(window.location.search);
            if (params.get('autoprint') === '1') {
                setTimeout(function() { window.print(); }, 500);
            }
        });
    </script>
</body>`;

content = content.replace('</body>', autoPrintScript);

fs.writeFileSync(ctrlPath, content, 'utf8');
console.log('Added autoprint script to HrisPayrollController HTML output!');
