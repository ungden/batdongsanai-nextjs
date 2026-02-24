"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/layout/BottomNavigation";
import DesktopLayout from "@/components/layout/DesktopLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Upload, FileText, CheckCircle, AlertTriangle, Clock, Download } from "lucide-react";

const DocumentAnalysis = () => {
  const isMobile = useIsMobile();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mockAnalysis = {
    documentType: "Chính sách bán hàng",
    extractedData: {
      paymentSchedule: [
        { phase: "Đặt cọc", percentage: 2, amount: "60 triệu VNĐ" },
        { phase: "Đợt 1", percentage: 30, amount: "900 triệu VNĐ", warning: "Vượt quy định 5%" },
        { phase: "Đợt 2", percentage: 20, amount: "600 triệu VNĐ" },
        { phase: "Bàn giao", percentage: 48, amount: "1.44 tỷ VNĐ" },
      ],
      interestRate: "8.5%/năm",
      gracePeriod: "6 tháng",
      penalties: "2%/tháng trên số tiền chậm trả",
      bankGuarantee: "Chưa có thông tin",
    },
    complianceCheck: {
      depositLimit: { status: "pass", value: "2%", requirement: "≤5%" },
      firstPayment: { status: "fail", value: "30%", requirement: "≤30%", warning: "Đúng giới hạn nhưng cao" },
      totalBeforeHandover: { status: "pass", value: "52%", requirement: "≤70%" },
      bankGuarantee: { status: "warning", value: "Chưa rõ", requirement: "Bắt buộc" },
    },
    riskAssessment: {
      overall: "medium",
      factors: [
        { type: "high", description: "Đợt 1 thanh toán cao (30%)" },
        { type: "medium", description: "Chưa có thông tin bảo lãnh ngân hàng" },
        { type: "low", description: "Tổng thanh toán trước bàn giao hợp lý" },
      ]
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsAnalyzing(false);
            setAnalysisResult(mockAnalysis);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass": return <CheckCircle className="w-4 h-4 text-success" />;
      case "fail": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-warning" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass": return "text-success";
      case "fail": return "text-destructive";
      case "warning": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-6">
          <h1 className="text-2xl font-bold mb-2">Phân tích tài liệu AI</h1>
          <p className="text-primary-foreground/80">Upload và phân tích tự động các file chính sách</p>
        </div>

        <div className="p-4 space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload tài liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Chọn file PDF</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Hỗ trợ: Chính sách bán hàng, Hợp đồng mẫu, Thông báo pháp lý
                </p>
              </div>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Đang phân tích...</span>
                    <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-4 animate-fade-in">
              {/* Document Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Kết quả phân tích
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Loại tài liệu:</span>
                      <Badge variant="outline">{analysisResult.documentType}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mức độ rủi ro:</span>
                      <Badge variant={analysisResult.riskAssessment.overall === "high" ? "destructive" : 
                                   analysisResult.riskAssessment.overall === "medium" ? "secondary" : "default"}>
                        {analysisResult.riskAssessment.overall === "high" ? "Cao" :
                         analysisResult.riskAssessment.overall === "medium" ? "Trung bình" : "Thấp"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Tiến độ thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.extractedData.paymentSchedule.map((payment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{payment.phase}</div>
                        <div className="text-sm text-muted-foreground">{payment.amount}</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{payment.percentage}%</span>
                          {payment.warning && <AlertTriangle className="w-4 h-4 text-warning" />}
                        </div>
                        {payment.warning && (
                          <div className="text-xs text-warning">{payment.warning}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Compliance Check */}
              <Card>
                <CardHeader>
                  <CardTitle>Kiểm tra tuân thủ pháp luật</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analysisResult.complianceCheck).map(([key, check]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <div className="font-medium">
                            {key === "depositLimit" ? "Giới hạn đặt cọc" :
                             key === "firstPayment" ? "Đợt thanh toán đầu" :
                             key === "totalBeforeHandover" ? "Tổng trước bàn giao" :
                             "Bảo lãnh ngân hàng"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Yêu cầu: {check.requirement}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getStatusColor(check.status)}`}>
                          {check.value}
                        </div>
                        {check.warning && (
                          <div className="text-xs text-warning">{check.warning}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle>Các yếu tố rủi ro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analysisResult.riskAssessment.factors.map((factor: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                        factor.type === "high" ? "text-destructive" :
                        factor.type === "medium" ? "text-warning" :
                        "text-muted-foreground"
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm">{factor.description}</div>
                      </div>
                      <Badge variant={factor.type === "high" ? "destructive" : 
                                    factor.type === "medium" ? "secondary" : "outline"}>
                        {factor.type === "high" ? "Cao" :
                         factor.type === "medium" ? "TB" : "Thấp"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Tải báo cáo phân tích PDF
                </Button>
                <Button variant="outline" className="w-full">
                  Lưu vào dự án
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!analysisResult && !isAnalyzing && (
            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn sử dụng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                    <span>Upload file PDF chính sách bán hàng hoặc hợp đồng mẫu</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                    <span>AI sẽ tự động trích xuất thông tin thanh toán và điều khoản</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                    <span>Hệ thống kiểm tra tuân thủ các quy định pháp luật hiện hành</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                    <span>Nhận cảnh báo tự động về các rủi ro tiềm ẩn</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Desktop layout
  return (
    <DesktopLayout 
      title="Phân tích tài liệu AI" 
      subtitle="Upload và phân tích tự động các file chính sách"
    >
      <div className="p-8 space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload tài liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Chọn file PDF</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hỗ trợ: Chính sách bán hàng, Hợp đồng mẫu, Thông báo pháp lý
              </p>
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Đang phân tích...</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results Grid for Desktop */}
        {analysisResult && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Kết quả phân tích
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Loại tài liệu:</span>
                    <Badge variant="outline">{analysisResult.documentType}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mức độ rủi ro:</span>
                    <Badge variant={analysisResult.riskAssessment.overall === "high" ? "destructive" : 
                                 analysisResult.riskAssessment.overall === "medium" ? "secondary" : "default"}>
                      {analysisResult.riskAssessment.overall === "high" ? "Cao" :
                       analysisResult.riskAssessment.overall === "medium" ? "Trung bình" : "Thấp"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Tiến độ thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.extractedData.paymentSchedule.map((payment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{payment.phase}</div>
                      <div className="text-sm text-muted-foreground">{payment.amount}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{payment.percentage}%</span>
                        {payment.warning && <AlertTriangle className="w-4 h-4 text-warning" />}
                      </div>
                      {payment.warning && (
                        <div className="text-xs text-warning">{payment.warning}</div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Compliance Check */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Kiểm tra tuân thủ pháp luật</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(analysisResult.complianceCheck).map(([key, check]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">
                          {key === "depositLimit" ? "Giới hạn đặt cọc" :
                           key === "firstPayment" ? "Đợt thanh toán đầu" :
                           key === "totalBeforeHandover" ? "Tổng trước bàn giao" :
                           "Bảo lãnh ngân hàng"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Yêu cầu: {check.requirement}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${getStatusColor(check.status)}`}>
                        {check.value}
                      </div>
                      {check.warning && (
                        <div className="text-xs text-warning">{check.warning}</div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Các yếu tố rủi ro</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysisResult.riskAssessment.factors.map((factor: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                      factor.type === "high" ? "text-destructive" :
                      factor.type === "medium" ? "text-warning" :
                      "text-muted-foreground"
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm">{factor.description}</div>
                    </div>
                    <Badge variant={factor.type === "high" ? "destructive" : 
                                  factor.type === "medium" ? "secondary" : "outline"}>
                      {factor.type === "high" ? "Cao" :
                       factor.type === "medium" ? "TB" : "Thấp"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="lg:col-span-2 flex gap-4">
              <Button className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Tải báo cáo phân tích PDF
              </Button>
              <Button variant="outline" className="flex-1">
                Lưu vào dự án
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!analysisResult && !isAnalyzing && (
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn sử dụng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                  <span>Upload file PDF chính sách bán hàng hoặc hợp đồng mẫu</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                  <span>AI sẽ tự động trích xuất thông tin thanh toán và điều khoản</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                  <span>Hệ thống kiểm tra tuân thủ các quy định pháp luật hiện hành</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                  <span>Nhận cảnh báo tự động về các rủi ro tiềm ẩn</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DesktopLayout>
  );
};

export default DocumentAnalysis;