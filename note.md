<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RavenMY - Live Dashboard</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900">
    <div class="min-h-screen p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-white">Live Dashboard</h1>
                <p class="text-gray-400">Last updated: 22 Nov 2024, 15:30 MYT</p>
            </div>
            <div class="flex gap-4">
                <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg">Today</button>
                <button class="bg-gray-800 text-white px-4 py-2 rounded-lg">Week</button>
                <button class="bg-gray-800 text-white px-4 py-2 rounded-lg">Month</button>
                <button class="bg-gray-800 text-white px-4 py-2 rounded-lg">Custom</button>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-800 p-4 rounded-lg">
                <h3 class="text-gray-400 text-sm mb-2">Total Kawasan Dipantau</h3>
                <p class="text-2xl font-bold text-white">222</p>
                <p class="text-green-500 text-sm">+5 dari semalam</p>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
                <h3 class="text-gray-400 text-sm mb-2">Sentiment Positif</h3>
                <p class="text-2xl font-bold text-white">67.5%</p>
                <p class="text-green-500 text-sm">+2.3% dari minggu lepas</p>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
                <h3 class="text-gray-400 text-sm mb-2">Isu Terpanas</h3>
                <p class="text-2xl font-bold text-white">Ekonomi</p>
                <p class="text-yellow-500 text-sm">78% engagement</p>
            </div>
            <div class="bg-gray-800 p-4 rounded-lg">
                <h3 class="text-gray-400 text-sm mb-2">Jangkaan Keluar Mengundi</h3>
                <p class="text-2xl font-bold text-white">82.3%</p>
                <p class="text-blue-500 text-sm">Berdasarkan analisis AI</p>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-12 gap-6">
            <!-- Sentiment Map -->
            <div class="col-span-8 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-white font-bold mb-4">Peta Sentiment Nasional</h2>
                <div class="bg-gray-700 h-96 rounded-lg flex items-center justify-center">
                    <p class="text-gray-400">[Interactive Malaysia Map Component]</p>
                </div>
            </div>

            <!-- Top Issues -->
            <div class="col-span-4 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-white font-bold mb-4">Isu Utama</h2>
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-white">Ekonomi</span>
                        <span class="text-green-500">78%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: 78%"></div>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-white">Kos Sara Hidup</span>
                        <span class="text-blue-500">65%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full" style="width: 65%"></div>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-white">Pekerjaan</span>
                        <span class="text-yellow-500">45%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-yellow-500 h-2 rounded-full" style="width: 45%"></div>
                    </div>
                </div>
            </div>

            <!-- Coalition Strength -->
            <div class="col-span-4 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-white font-bold mb-4">Kekuatan Pakatan</h2>
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-white">PH-BN</span>
                        <span class="text-indigo-500">42%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-indigo-500 h-2 rounded-full" style="width: 42%"></div>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-white">PN</span>
                        <span class="text-green-500">38%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: 38%"></div>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-white">GPS</span>
                        <span class="text-red-500">12%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-red-500 h-2 rounded-full" style="width: 12%"></div>
                    </div>
                </div>
            </div>

            <!-- Demographic Distribution -->
            <div class="col-span-4 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-white font-bold mb-4">Taburan Demografi</h2>
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-white">Melayu</span>
                        <span class="text-purple-500">55%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-purple-500 h-2 rounded-full" style="width: 55%"></div>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-white">Cina</span>
                        <span class="text-yellow-500">23%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-yellow-500 h-2 rounded-full" style="width: 23%"></div>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-white">India</span>
                        <span class="text-orange-500">7%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="bg-orange-500 h-2 rounded-full" style="width: 7%"></div>
                    </div>
                </div>
            </div>

            <!-- Recent Activities -->
            <div class="col-span-4 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-white font-bold mb-4">Aktiviti Terkini</h2>
                <div class="space-y-4">
                    <div class="border-l-4 border-green-500 pl-3">
                        <p class="text-white">Ceramah di Selangor</p>
                        <p class="text-gray-400 text-sm">2000 kehadiran</p>
                        <p class="text-gray-500 text-xs">2 jam yang lepas</p>
                    </div>
                    <div class="border-l-4 border-yellow-500 pl-3">
                        <p class="text-white">Program di Johor</p>
                        <p class="text-gray-400 text-sm">1500 kehadiran</p>
                        <p class="text-gray-500 text-xs">4 jam yang lepas</p>
                    </div>
                    <div class="border-l-4 border-red-500 pl-3">
                        <p class="text-white">Majlis di Kedah</p>
                        <p class="text-gray-400 text-sm">800 kehadiran</p>
                        <p class="text-gray-500 text-xs">6 jam yang lepas</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>


regional-stronghold
analisa-kawasan
coalition-tracking
demographic-aI
demographic-mapping
issue-monitoring
live-dashboard
ml-ai-analysis
national-popularity-metric
pemimpin-effect
prediction-metrics
regional-stronghold
reporting-features
special-analysis
step-assessment
summary
swot-evaluation