import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    computeStatusBreakdown,
    computeMonthlyTrend,
    computePipelineRates,
    computeSourceBreakdown,
    STATUS_COLORS,
    getStatusLabel,
} from '../utils/dashboardStats';

function ChartCard({ title, subtitle, children }) {
    return (
        <div
            className="rounded-2xl border p-5 transition-all hover:shadow-md"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
            <h3 className="font-serif text-lg font-bold" style={{ color: 'var(--color-text)' }}>{title}</h3>
            {subtitle && (
                <p className="text-xs font-sans mt-0.5 mb-4" style={{ color: 'var(--color-text-soft)' }}>{subtitle}</p>
            )}
            {!subtitle && <div className="mb-4" />}
            {children}
        </div>
    );
}

function PipelineBar({ label, value, color }) {
    return (
        <div>
            <div className="flex items-center justify-between text-xs font-sans mb-1.5">
                <span style={{ color: 'var(--color-text-soft)' }}>{label}</span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{value}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${value}%`, background: color }}
                />
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div
            className="rounded-lg px-3 py-2 text-xs font-sans shadow-lg border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
            <p className="font-semibold">{label || payload[0].name}</p>
            <p style={{ color: 'var(--color-text-soft)' }}>{payload[0].value} application{payload[0].value !== 1 ? 's' : ''}</p>
        </div>
    );
}

export default function DashboardAnalytics({
    applications,
    activeStatusFilter,
    onStatusFilterChange,
}) {
    const statusData = computeStatusBreakdown(applications);
    const monthlyData = computeMonthlyTrend(applications);
    const pipeline = computePipelineRates(applications);
    const sourceData = computeSourceBreakdown(applications);
    const hasData = applications.length > 0;

    function handlePieClick(entry) {
        if (!entry?.status) return;
        onStatusFilterChange(activeStatusFilter === entry.status ? null : entry.status);
    }

    if (!hasData) return null;

    return (
        <section className="mb-10 space-y-6 animate-slide-up animation-delay-200">
            <div>
                <h2 className="font-serif text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Analytics</h2>
                <p className="text-sm font-sans mt-1" style={{ color: 'var(--color-text-soft)' }}>
                    Click a chart segment to filter your applications below.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <ChartCard title="Status breakdown" subtitle="Distribution across your pipeline">
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={52}
                                    outerRadius={78}
                                    paddingAngle={3}
                                    onClick={handlePieClick}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {statusData.map((entry) => (
                                        <Cell
                                            key={entry.status}
                                            fill={entry.fill}
                                            opacity={activeStatusFilter && activeStatusFilter !== entry.status ? 0.35 : 1}
                                            stroke={activeStatusFilter === entry.status ? 'var(--color-text)' : 'transparent'}
                                            strokeWidth={activeStatusFilter === entry.status ? 2 : 0}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    formatter={(value) => <span style={{ color: 'var(--color-text-soft)', fontSize: 12 }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <ChartCard title="Applications over time" subtitle="Last 6 months by apply date">
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: 'var(--color-text-soft)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fill: 'var(--color-text-soft)', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="applications"
                                    fill="var(--color-accent)"
                                    radius={[6, 6, 0, 0]}
                                    name="Applications"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <ChartCard title="Pipeline conversion" subtitle="How your search is progressing">
                    <div className="space-y-5 pt-2">
                        <PipelineBar label="Reached interview stage" value={pipeline.interviewRate} color={STATUS_COLORS.interviewing} />
                        <PipelineBar label="Received offers" value={pipeline.offerRate} color={STATUS_COLORS.offered} />
                        <PipelineBar label="Rejected" value={pipeline.rejectionRate} color={STATUS_COLORS.rejected} />
                    </div>
                </ChartCard>
            </div>

            {sourceData.length > 1 && (
                <ChartCard title="Top application sources" subtitle="Where your applications come from">
                    <div className="flex flex-wrap gap-2 mt-1">
                        {sourceData.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-sans"
                                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
                            >
                                <span style={{ color: 'var(--color-text)' }}>{item.name}</span>
                                <span
                                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
                                >
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            )}

            {activeStatusFilter && (
                <div
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-sans"
                    style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent)' }}
                >
                    <span style={{ color: 'var(--color-text)' }}>
                        Filtering by: <strong>{getStatusLabel(activeStatusFilter)}</strong>
                    </span>
                    <button
                        type="button"
                        onClick={() => onStatusFilterChange(null)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold transition"
                        style={{ background: 'var(--color-accent)', color: '#FFFFFF' }}
                    >
                        Clear filter
                    </button>
                </div>
            )}
        </section>
    );
}
