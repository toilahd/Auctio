import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { MessageSquare, Send, CheckCircle, Clock } from "lucide-react";

interface Question {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  asker: string;
  question: string;
  answer?: string;
  askedAt: string;
  answeredAt?: string;
  status: "pending" | "answered";
}

const QAManagementPage = () => {
  const [activeTab, setActiveTab] = useState<"pending" | "answered">("pending");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Mock data - TODO: Fetch from backend
  const pendingQuestions: Question[] = useMemo(() => [
    {
      id: "q1",
      productId: "1",
      productTitle: "iPhone 15 Pro Max 256GB - Nguyên seal",
      productImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
      asker: "Nguyễn V***",
      question: "Máy có bảo hành chính hãng Apple không ạ? Bảo hành bao lâu?",
      askedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    },
    {
      id: "q2",
      productId: "1",
      productTitle: "iPhone 15 Pro Max 256GB - Nguyên seal",
      productImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
      asker: "Trần T***",
      question: "Shop có hỗ trợ trả góp không? Qua công ty tài chính nào?",
      askedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    },
    {
      id: "q3",
      productId: "2",
      productTitle: "MacBook Pro M3 14 inch 2024",
      productImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
      asker: "Lê H***",
      question: "Có thể xem máy trực tiếp không ạ? Shop ở đâu?",
      askedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: "pending",
    },
  ], []);

  const answeredQuestions: Question[] = useMemo(() => [
    {
      id: "q4",
      productId: "1",
      productTitle: "iPhone 15 Pro Max 256GB - Nguyên seal",
      productImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
      asker: "Phạm M***",
      question: "Máy có kèm sạc nhanh không ạ?",
      answer: "Dạ không ạ, theo chính sách của Apple thì máy chỉ kèm cáp USB-C. Nếu cần sạc nhanh, shop có thể hỗ trợ giá tốt cho anh/chị.",
      askedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      answeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      status: "answered",
    },
    {
      id: "q5",
      productId: "2",
      productTitle: "MacBook Pro M3 14 inch 2024",
      productImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
      asker: "Hoàng N***",
      question: "Máy đã nâng cấp RAM chưa ạ?",
      answer: "Dạ chưa ạ, máy còn nguyên cấu hình gốc 8GB RAM. Nếu anh/chị cần nâng cấp, shop có thể tư vấn sau khi mua.",
      askedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      answeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
      status: "answered",
    },
  ], []);

  const getTimeAgo = (dateString: string) => {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diff = now - then;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    return `${minutes} phút trước`;
  };

  const handleSubmitAnswer = (questionId: string) => {
    const answer = answers[questionId];
    if (!answer || answer.trim().length < 10) {
      alert("Câu trả lời phải có ít nhất 10 ký tự");
      return;
    }

    // TODO: Call API to submit answer
    console.log("Submitting answer for question:", questionId, answer);
    alert("Câu trả lời đã được gửi thành công!");
    setAnswers({ ...answers, [questionId]: "" });
  };

  const currentQuestions = activeTab === "pending" ? pendingQuestions : answeredQuestions;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quản lý Hỏi & Đáp
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Trả lời câu hỏi từ người mua để tăng uy tín và tỷ lệ bán hàng
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Chờ trả lời
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-orange-600">
                  {pendingQuestions.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Đã trả lời
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-green-600">
                  {answeredQuestions.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("pending")}
                className={`pb-4 px-2 border-b-2 font-semibold transition ${
                  activeTab === "pending"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-primary"
                }`}
              >
                Chờ trả lời
                {pendingQuestions.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-950/20 text-orange-600">
                    {pendingQuestions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("answered")}
                className={`pb-4 px-2 border-b-2 font-semibold transition ${
                  activeTab === "answered"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-primary"
                }`}
              >
                Đã trả lời
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-950/20 text-green-600">
                  {answeredQuestions.length}
                </span>
              </button>
            </div>
          </div>

          {/* Questions List */}
          {currentQuestions.length > 0 ? (
            <div className="space-y-6">
              {currentQuestions.map((question) => (
                <Card key={question.id}>
                  <CardContent className="p-6">
                    {/* Product Info */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b dark:border-gray-700">
                      <img
                        src={question.productImage}
                        alt={question.productTitle}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <a
                          href={`/product/${question.productId}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-primary"
                        >
                          {question.productTitle}
                        </a>
                      </div>
                    </div>

                    {/* Question */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {question.asker}
                          </span>
                          <span className="text-sm text-gray-500">
                            hỏi {getTimeAgo(question.askedAt)}
                          </span>
                        </div>
                        {question.status === "pending" && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 dark:bg-orange-950/20 text-orange-600">
                            Chờ trả lời
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                        {question.question}
                      </p>
                    </div>

                    {/* Answer or Answer Form */}
                    {question.status === "answered" && question.answer ? (
                      <div className="pl-6 border-l-2 border-primary/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-primary">Bạn</span>
                          <span className="text-sm text-gray-500">
                            trả lời {question.answeredAt && getTimeAgo(question.answeredAt)}
                          </span>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {question.answer}
                        </p>
                      </div>
                    ) : (
                      <div className="pl-6 border-l-2 border-gray-300 dark:border-gray-700">
                        <div className="space-y-3">
                          <Input
                            value={answers[question.id] || ""}
                            onChange={(e) =>
                              setAnswers({ ...answers, [question.id]: e.target.value })
                            }
                            placeholder="Nhập câu trả lời của bạn..."
                            className="w-full"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {(answers[question.id] || "").length} ký tự (tối thiểu 10)
                            </span>
                            <Button
                              onClick={() => handleSubmitAnswer(question.id)}
                              size="sm"
                              className="gap-2"
                            >
                              <Send className="w-4 h-4" />
                              Gửi câu trả lời
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {activeTab === "pending" ? "Không có câu hỏi nào" : "Chưa trả lời câu hỏi nào"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {activeTab === "pending"
                  ? "Hiện tại không có câu hỏi nào cần trả lời."
                  : "Bạn chưa trả lời câu hỏi nào."}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QAManagementPage;
