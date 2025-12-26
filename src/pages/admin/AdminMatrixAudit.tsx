import { useState } from 'react';
import PortalLayout from '@/components/portal/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  ChevronRight,
  Activity,
  Users,
  Layers,
  Shield
} from 'lucide-react';
import { useMatrixAudit, MatrixNode, ValidationResult, IntegrityReport } from '@/hooks/useMatrixAudit';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminMatrixAudit = () => {
  const { 
    allNodes, 
    placementLogs, 
    isLoading, 
    searchUser, 
    getParentChain, 
    verifyNodePlacement,
    runFullIntegrityAudit,
    refetch 
  } = useMatrixAudit();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<MatrixNode | null>(null);
  const [parentChain, setParentChain] = useState<MatrixNode[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const node = await searchUser(searchTerm.trim());
      if (node) {
        setSelectedNode(node);
        const chain = await getParentChain(node.id);
        setParentChain(chain);
        setValidationResult(null);
        toast.success('Member found');
      } else {
        toast.error('No member found with that ID or email');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedNode) return;
    
    setIsValidating(true);
    try {
      const result = await verifyNodePlacement(selectedNode);
      setValidationResult(result);
      toast.success(result.passed ? 'All checks passed!' : 'Some checks failed');
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleFullAudit = async () => {
    setIsAuditing(true);
    try {
      const report = await runFullIntegrityAudit();
      setIntegrityReport(report);
      toast.success('Audit complete');
    } catch (error) {
      toast.error('Audit failed');
    } finally {
      setIsAuditing(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-500/20 text-green-400';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400';
      case 'critical': return 'bg-red-500/20 text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPlacementSourceColor = (source: string) => {
    switch (source) {
      case 'direct_signup': return 'bg-green-500/20 text-green-400';
      case 'spillover': return 'bg-blue-500/20 text-blue-400';
      case 'admin_placement': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Matrix Audit</h1>
            <p className="text-muted-foreground">Verify matrix placements and run integrity checks</p>
          </div>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{allNodes.length}</p>
                  <p className="text-xs text-muted-foreground">Total Nodes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Layers className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.max(...allNodes.map(n => n.level), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Deepest Level</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{placementLogs.length}</p>
                  <p className="text-xs text-muted-foreground">Recent Logs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {integrityReport?.overallHealth || '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">Health Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="search" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="search">Search & Verify</TabsTrigger>
            <TabsTrigger value="audit">Full Audit</TabsTrigger>
            <TabsTrigger value="logs">Placement Logs</TabsTrigger>
          </TabsList>

          {/* Search & Verify Tab */}
          <TabsContent value="search" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Search Member</CardTitle>
                <CardDescription>Search by user ID or email to view their matrix position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter user ID or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {selectedNode && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Node Details</h3>
                      <Button 
                        onClick={handleVerify} 
                        disabled={isValidating}
                        variant="outline"
                        size="sm"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Verify Placement
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium text-foreground">
                          {selectedNode.profile?.full_name || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Level</p>
                        <p className="font-medium text-foreground">{selectedNode.level}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Position Index</p>
                        <p className="font-medium text-foreground">{selectedNode.position_index || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Placement Source</p>
                        <Badge className={getPlacementSourceColor(selectedNode.placement_source || '')}>
                          {selectedNode.placement_source || 'Unknown'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Placed At</p>
                        <p className="font-medium text-foreground">
                          {selectedNode.placed_at 
                            ? format(new Date(selectedNode.placed_at), 'MMM d, yyyy HH:mm')
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Position in Parent</p>
                        <p className="font-medium text-foreground">
                          {selectedNode.position === 1 ? 'Left' : selectedNode.position === 2 ? 'Middle' : selectedNode.position === 3 ? 'Right' : 'Root'}
                        </p>
                      </div>
                    </div>

                    {/* Parent Chain */}
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Parent Chain (to root):</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {parentChain.map((node, idx) => (
                          <div key={node.id} className="flex items-center gap-2">
                            <Badge variant={idx === 0 ? "default" : "outline"}>
                              L{node.level}: {node.profile?.full_name || 'Unknown'}
                            </Badge>
                            {idx < parentChain.length - 1 && (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Validation Results */}
                    {validationResult && (
                      <div className="pt-4 border-t border-border space-y-3">
                        <div className="flex items-center gap-2">
                          {validationResult.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          <p className="font-medium text-foreground">
                            {validationResult.passed ? 'All Checks Passed' : 'Validation Issues Found'}
                          </p>
                        </div>
                        <div className="grid gap-2">
                          {Object.entries(validationResult.checks).map(([key, check]) => (
                            <div 
                              key={key} 
                              className={`flex items-center justify-between p-2 rounded-lg ${
                                check.passed ? 'bg-green-500/10' : 'bg-red-500/10'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {check.passed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400" />
                                )}
                                <span className="text-sm font-medium text-foreground">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">{check.details}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Full Audit Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Full Integrity Audit</CardTitle>
                    <CardDescription>Run comprehensive checks on the entire matrix</CardDescription>
                  </div>
                  <Button onClick={handleFullAudit} disabled={isAuditing}>
                    <Activity className="w-4 h-4 mr-2" />
                    {isAuditing ? 'Running...' : 'Run Audit'}
                  </Button>
                </div>
              </CardHeader>
              {integrityReport && (
                <CardContent className="space-y-6">
                  {/* Health Status */}
                  <div className={`p-4 rounded-lg ${getHealthColor(integrityReport.overallHealth)}`}>
                    <div className="flex items-center gap-2">
                      {integrityReport.overallHealth === 'healthy' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : integrityReport.overallHealth === 'warning' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      <span className="font-semibold capitalize">{integrityReport.overallHealth}</span>
                    </div>
                  </div>

                  {/* Nodes Per Level */}
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Nodes Per Level</h4>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                        <div key={level} className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">L{level}</p>
                          <p className="font-bold text-foreground">
                            {integrityReport.nodesPerLevel[level] || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            / {integrityReport.expectedNodesPerLevel[level]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Issues */}
                  {integrityReport.holes.length > 0 && (
                    <div className="p-4 bg-red-500/10 rounded-lg">
                      <h4 className="font-medium text-red-400 mb-2">Holes Detected</h4>
                      <p className="text-sm text-muted-foreground">
                        Missing position indexes: {integrityReport.holes.map(h => h.positionIndex).join(', ')}
                      </p>
                    </div>
                  )}

                  {integrityReport.duplicatePositionIndexes.length > 0 && (
                    <div className="p-4 bg-red-500/10 rounded-lg">
                      <h4 className="font-medium text-red-400 mb-2">Duplicate Position Indexes</h4>
                      <p className="text-sm text-muted-foreground">
                        Duplicates: {integrityReport.duplicatePositionIndexes.join(', ')}
                      </p>
                    </div>
                  )}

                  {integrityReport.orphanNodes.length > 0 && (
                    <div className="p-4 bg-yellow-500/10 rounded-lg">
                      <h4 className="font-medium text-yellow-400 mb-2">Orphan Nodes</h4>
                      <p className="text-sm text-muted-foreground">
                        {integrityReport.orphanNodes.length} nodes with missing parents
                      </p>
                    </div>
                  )}

                  {integrityReport.overallHealth === 'healthy' && (
                    <div className="p-4 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">No issues detected!</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* Placement Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Recent Placement Logs</CardTitle>
                <CardDescription>Detailed audit trail of all matrix placements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {placementLogs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No placement logs yet</p>
                  ) : (
                    placementLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="p-3 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getPlacementSourceColor(log.placement_source)}>
                            {log.placement_source}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Position Index</p>
                            <p className="font-medium text-foreground">{log.position_index}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Level</p>
                            <p className="font-medium text-foreground">{log.level}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Checks</p>
                            <div className="flex gap-1">
                              {Object.values(log.checks_passed).every(Boolean) ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
};

export default AdminMatrixAudit;
