const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const modelPath = path.join(backendDir, 'app/Models/HrisNews.php');

const newModelContent = `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;
use App\\Services\\EncryptedStorageService;

class HrisNews extends Model
{
    use HasFactory;

    protected $table = 'hris_news';

    protected $fillable = [
        'tenant_id',
        'title',
        'category',
        'content',
        'banner_path',
        'priority',
        'target_audience',
        'is_published',
        'published_at',
        'created_by',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected $appends = [
        'banner_base64',
        'banner_url',
    ];

    public function getBannerBase64Attribute()
    {
        if ($this->banner_path) {
            return EncryptedStorageService::getBase64($this->banner_path);
        }
        return null;
    }

    public function getBannerUrlAttribute()
    {
        if ($this->banner_path) {
            return url("/api/hris/news/{$this->id}/banner");
        }
        return null;
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }
}
`;

fs.writeFileSync(modelPath, newModelContent, 'utf8');
console.log('Successfully updated HrisNews model with banner_base64 and banner_url appends!');
