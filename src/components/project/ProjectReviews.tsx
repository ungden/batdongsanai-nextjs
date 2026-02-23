"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  ThumbsUp, 
  MessageSquare,
  TrendingUp,
  Home,
  DollarSign,
  Shield,
  Users,
  CheckCircle
} from "lucide-react";

interface ProjectReviewsProps {
  projectId: string;
  projectName: string;
}

const ProjectReviews = ({ projectId, projectName }: ProjectReviewsProps) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "positive" | "negative">("all");

  // Mock data
  const overallRating = 4.6;
  const totalReviews = 127;
  
  const ratingBreakdown = [
    { stars: 5, count: 78, percentage: 61 },
    { stars: 4, count: 32, percentage: 25 },
    { stars: 3, count: 12, percentage: 9 },
    { stars: 2, count: 4, percentage: 3 },
    { stars: 1, count: 1, percentage: 2 }
  ];

  const categoryRatings = [
    { category: "Vị trí", score: 4.8, icon: Home, color: "text-blue-600 dark:text-blue-400" },
    { category: "Giá cả", score: 4.2, icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400" },
    { category: "Pháp lý", score: 4.9, icon: Shield, color: "text-purple-600 dark:text-purple-400" },
    { category: "Tiện ích", score: 4.5, icon: Users, color: "text-amber-600 dark:text-amber-400" },
    { category: "Chất lượng", score: 4.7, icon: CheckCircle, color: "text-teal-600 dark:text-teal-400" }
  ];

  const reviews = [
    {
      id: 1,
      author: "Nguyễn Văn A",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
      rating: 5,
      date: "15/12/2024",
      verified: true,
      content: "Dự án rất tốt, vị trí đắc địa, pháp lý rõ ràng. Tôi đã mua căn 2PN và rất hài lòng với quyết định của mình. Chủ đầu tư uy tín, tiến độ đúng cam kết.",
      helpful: 24,
      type: "owner"
    },
    {
      id: 2,
      author: "Trần Thị B",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
      rating: 4,
      date: "10/12/2024",
      verified: true,
      content: "Giá hơi cao so với khu vực nhưng xứng đáng với chất lượng. Tiện ích đầy đủ, an ninh tốt. Duy nhất là bãi đỗ xe hơi chật vào giờ cao điểm.",
      helpful: 18,
      type: "owner"
    },
    {
      id: 3,
      author: "Lê Văn C",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
      rating: 5,
      date: "05/12/2024",
      verified: false,
      content: "Tôi đã khảo sát nhiều dự án và quyết định chọn đây. View đẹp, không gian thoáng, gần trường học và bệnh viện. Rất phù hợp cho gia đình có con nhỏ.",
      helpful: 15,
      type: "investor"
    },
    {
      id: 4,
      author: "Phạm Thị D",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
      rating: 3,
      date: "01/12/2024",
      verified: true,
      content: "Dự án ổn nhưng tiến độ bàn giao chậm hơn cam kết khoảng 2 tháng. Chất lượng hoàn thiện tốt nhưng cần cải thiện dịch vụ chăm sóc khách hàng.",
      helpful: 8,
      type: "owner"
    },
    {
      id: 5,
      author: "Hoàng Văn E",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
      rating: 5,
      date: "28/11/2024",
      verified: true,
      content: "Đầu tư vào dự án này từ giai đoạn đầu, giá đã tăng 15% sau 1 năm. ROI cho thuê cũng khá tốt, khoảng 5%/năm. Rất hài lòng với quyết định đầu tư.",
      helpful: 32,
      type: "investor"
    }
  ];

  const filteredReviews = reviews.filter(review => {
    if (activeFilter === "positive") return review.rating >= 4;
    if (activeFilter === "negative") return review.rating < 4;
    return true;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-900/20 rounded-t-xl border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MessageSquare className="w-5 h-5 text-primary" />
          Đánh giá từ người dùng
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Overall Rating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Overall Score */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/50">
            <div className="text-6xl font-black text-foreground mb-2">
              {overallRating}
            </div>
            <div className="flex gap-1 mb-2">
              {renderStars(Math.round(overallRating))}
            </div>
            <div className="text-sm text-muted-foreground">
              Dựa trên {totalReviews} đánh giá
            </div>
          </div>

          {/* Right: Rating Breakdown */}
          <div className="space-y-2">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-foreground">{item.stars}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
                <Progress value={item.percentage} className="h-2 flex-1 bg-muted" />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Ratings */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Đánh giá theo tiêu chí</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categoryRatings.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="p-4 bg-muted/30 rounded-xl text-center border border-border/50">
                  <IconComponent className={`w-5 h-5 mx-auto mb-2 ${item.color}`} />
                  <div className="text-xs text-muted-foreground mb-1">{item.category}</div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg font-bold text-foreground">{item.score}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
            className="rounded-xl"
          >
            Tất cả ({reviews.length})
          </Button>
          <Button
            variant={activeFilter === "positive" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("positive")}
            className="rounded-xl"
          >
            Tích cực ({reviews.filter(r => r.rating >= 4).length})
          </Button>
          <Button
            variant={activeFilter === "negative" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("negative")}
            className="rounded-xl"
          >
            Cần cải thiện ({reviews.filter(r => r.rating < 4).length})
          </Button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="rounded-xl border-0 bg-muted/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={review.avatar} />
                    <AvatarFallback>{review.author[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{review.author}</span>
                          {review.verified && (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Đã xác thực
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {review.type === "owner" ? "Chủ nhà" : "Nhà đầu tư"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{review.date}</div>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {review.content}
                    </p>
                    
                    <div className="flex items-center gap-4 pt-2">
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                        <span>Hữu ích ({review.helpful})</span>
                      </button>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <MessageSquare className="w-3 h-3" />
                        <span>Trả lời</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <Button variant="outline" className="rounded-xl">
            Xem thêm đánh giá
          </Button>
        </div>

        {/* Expert Review */}
        <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/50">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-background rounded-xl shadow-sm text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">Đánh giá từ chuyên gia PropertyHub</h3>
                <Badge className="bg-blue-600 text-white text-xs">Chuyên gia</Badge>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                {projectName} là một dự án đáng chú ý với điểm mạnh về vị trí và pháp lý. 
                Chủ đầu tư uy tín, tiến độ ổn định. Giá hiện tại hợp lý so với thị trường. 
                Phù hợp cho cả mục đích ở và đầu tư. Tuy nhiên, nhà đầu tư nên lưu ý về 
                nguồn cung dồi dào trong khu vực có thể ảnh hưởng đến tốc độ tăng giá ngắn hạn.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectReviews;