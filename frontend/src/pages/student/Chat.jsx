import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import API from '../../utils/api';
import {
  Sparkles,
  Zap,
  Trophy,
  CheckCircle2,
  History,
  Clock,
  PlayCircle,
  X,
  Loader2,
  ChevronRight,
  HelpCircle,
  Upload
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Chat = () => {
  const [activeView, setActiveView] = useState('quiz-generator');
  
  // Quiz Generator State
  const [quizFile, setQuizFile] = useState(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionType, setQuestionType] = useState('MCQ');
  const [quizTopic, setQuizTopic] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const generateQuiz = async () => {
    if (!quizFile) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setIsGeneratingQuiz(true);
      const formData = new FormData();
      formData.append('file', quizFile);
      formData.append('difficulty', difficulty);
      formData.append('numQuestions', numQuestions.toString());
      formData.append('questionType', questionType);
      
      const typeInstruction = questionType === 'True/False' 
        ? `REQUIREMENT 2: questionType is True/False. Every question must have EXACTLY TWO (2) options: "True" and "False".`
        : `REQUIREMENT 2: questionType is MCQ. Every question must have EXACTLY FOUR (4) options.`;
        
      formData.append('instructions', `Topic Focus: ${quizTopic || 'General Material'}. 
        REQUIREMENT 1: Generate EXACTLY ${numQuestions} questions. 
        ${typeInstruction}`);

      const response = await API.post('/ai/generate-quiz', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setGeneratedQuiz(response.data.quiz);
      setUserAnswers({});
      setQuizScore(null);
      setIsModalOpen(true);
      setIsQuizStarted(false);
      setCurrentQuestionIndex(0);
      toast.success('Quiz ready for attempt!');
    } catch (error) {
      console.error('Quiz generation error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to generate actual AI quiz';
      toast.error(errorMsg);
      setIsModalOpen(false);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const submitQuiz = () => {
    if (!generatedQuiz) return;
    
    if (Object.keys(userAnswers).length < generatedQuiz.questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    let score = 0;
    generatedQuiz.questions.forEach(q => {
      if (userAnswers[q.id] === q.answer) {
        score++;
      }
    });

    const total = generatedQuiz.questions.length;
    const percentage = (score / total) * 100;

    setQuizScore({
      points: score,
      total: total,
      percentage: percentage
    });

    toast.success('Assessment Completed!');
  };

  const downloadQuizText = () => {
    if (!generatedQuiz) return;
    let text = `${generatedQuiz.title}\n\n`;
    generatedQuiz.questions.forEach((q, i) => {
      text += `${i + 1}. ${q.question}\n`;
      q.options.forEach((opt, j) => {
        const letters = ['A', 'B', 'C', 'D'];
        text += `   ${letters[j] || '-'}. ${opt}\n`;
      });
      const answerLetter = ['A', 'B', 'C', 'D'][q.answer] || 'Unknown';
      text += `   Answer: ${answerLetter}\n\n`;
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quiz_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Quiz downloaded successfully!');
  };

  return (
    <DashboardLayout>
      <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quiz Generation</h1>
                <p className="text-gray-600 mt-1">
                  Transform your academic materials into high-quality assessments locally and instantly.
                </p>
              </div>
            </div>
          </div>

          <Card className="mb-6 p-8">
            <div className="space-y-8">
                    <div className="space-y-2">
                       <label className="block text-sm font-semibold text-gray-700">What should the quiz focus on?</label>
                       <textarea 
                        value={quizTopic}
                        onChange={(e) => setQuizTopic(e.target.value)}
                        placeholder="e.g. Focus on Chapter 3 mechanisms, include specific dates from the lecture..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm min-h-[100px] resize-none"
                       />
                    </div>

                    <div 
                      className={`border-2 border-dashed rounded-xl p-12 transition-all text-center cursor-pointer ${quizFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                      onClick={() => document.getElementById('quiz-file-input').click()}
                    >
                      <input 
                        id="quiz-file-input"
                        type="file" 
                        className="hidden" 
                        onChange={(e) => setQuizFile(e.target.files[0])}
                      />
                      
                      {quizFile ? (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <p className="text-base font-semibold text-gray-900">{quizFile.name}</p>
                          <p className="text-sm text-blue-600 mt-1">Document Attached</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                            <Upload className="w-8 h-8" />
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 mb-1">Upload Study Material</h4>
                          <p className="text-sm text-gray-500">Drop your PDF or notes here to start</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select 
                        label="Difficulty Level"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        options={[
                          { value: 'Easy', label: 'Easy' },
                          { value: 'Medium', label: 'Medium' },
                          { value: 'Hard', label: 'Hard' }
                        ]}
                      />
                      <Select 
                        label="Quantity"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                        options={[
                          { value: '5', label: '5 Questions' },
                          { value: '10', label: '10 Questions' },
                          { value: '15', label: '15 Questions' },
                          { value: '20', label: '20 Questions' },
                          { value: '25', label: '25 Questions' },
                          { value: '30', label: '30 Questions' }
                        ]}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={generateQuiz}
                        loading={isGeneratingQuiz}
                        icon={Sparkles}
                      >
                        Generate Quiz
                      </Button>
                    </div>
            </div>
          </Card>
      </div>

        {/* Quiz Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => !quizScore && !isGeneratingQuiz && setIsModalOpen(false)}
          title={isGeneratingQuiz ? "Generating Assessment" : generatedQuiz?.title || "Quiz Assessment"}
          size="xl"
          showCloseButton={(!isQuizStarted && !isGeneratingQuiz) || !!quizScore}
        >
          {isGeneratingQuiz ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-8 items-center justify-center">
                <Sparkles className="w-12 h-12 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-[#0a3d62] mb-3">Crafting Your Quiz</h3>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is analyzing your material...</span>
                </div>
                <p className="text-gray-400 text-sm max-w-xs leading-relaxed font-medium">
                  Extracting key concepts and building unique questions specifically for you.
                </p>
              </div>
            </div>
          ) : !isQuizStarted ? (
            <div className="py-12 flex flex-col items-center text-center bg-white rounded-xl mx-4">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
                <PlayCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Master Your Coursework</h2>
              <p className="text-gray-500 mb-10 max-w-md">
                Take this high-quality assessment to validate your understanding of the uploaded material.
              </p>

              <div className="flex flex-col items-center gap-4">
                <Button 
                  variant="primary" 
                  onClick={() => setIsQuizStarted(true)}
                  className="px-8 py-3 rounded-[2rem] font-bold shadow-lg shadow-blue-100"
                >
                  Start Attempt
                </Button>
                <p className="text-sm text-gray-400">Single attempt encouraged for best results</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {!quizScore ? (
                <div className="space-y-6">
                  {/* Progress Indicator */}
                  <div className="mb-8 px-4 text-center">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-3">
                      Question {currentQuestionIndex + 1} of {generatedQuiz?.questions.length}
                    </p>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300" 
                        style={{width: `${((currentQuestionIndex + 1) / generatedQuiz?.questions.length) * 100}%`}}
                      />
                    </div>
                  </div>

                  {generatedQuiz?.questions && generatedQuiz.questions[currentQuestionIndex] && (
                    <Card className="p-10 rounded-[3rem] border-2 border-gray-50 transition-all duration-500">
                      <div className="space-y-8">
                        <h4 className="text-2xl font-black text-gray-900 leading-tight">
                          {generatedQuiz.questions[currentQuestionIndex].question}
                        </h4>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {generatedQuiz.questions[currentQuestionIndex].options.map((opt, optIndex) => {
                            const qId = generatedQuiz.questions[currentQuestionIndex].id;
                            const isSelected = userAnswers[qId] === optIndex;
                            let baseStyle = "flex items-start gap-6 p-6 rounded-3xl border-2 transition-all font-bold text-lg text-left w-full relative group";
                            
                            baseStyle += isSelected 
                              ? " border-blue-600 bg-white text-blue-900 shadow-2xl shadow-blue-100 ring-4 ring-blue-50 transform scale-[1.01]" 
                              : " border-gray-100 bg-gray-50/20 hover:border-blue-200 hover:bg-white hover:shadow-xl text-gray-600";

                            return (
                              <button
                                key={optIndex}
                                onClick={() => handleSelectOption(qId, optIndex)}
                                className={baseStyle}
                              >
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${isSelected ? 'border-blue-600 bg-blue-600 scale-110' : 'border-gray-200 group-hover:border-blue-300'}`}>
                                  {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />}
                                </div>
                                <span className="flex-1 leading-snug">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  )}

                  <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100 px-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-8 py-4 rounded-[2rem] font-bold text-gray-500"
                    >
                      Previous
                    </Button>
                    
                    {currentQuestionIndex === generatedQuiz?.questions.length - 1 ? (
                      <Button 
                        icon={CheckCircle2} 
                        onClick={submitQuiz} 
                        size="xl"
                        className="px-16 py-4 rounded-[2.5rem] font-black shadow-2xl shadow-blue-200"
                      >
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setCurrentQuestionIndex(Math.min(generatedQuiz.questions.length - 1, currentQuestionIndex + 1))}
                        className="px-12 py-4 bg-blue-600 text-white rounded-[2rem] font-bold shadow-lg shadow-blue-100"
                      >
                        Next Question
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-h-[72vh] overflow-y-auto pr-4 custom-scrollbar px-2 pb-10">
                  {/* Minimalist White Theme Score Summary */}
                  <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8">Assessment Results</h3>
                    <div className="flex flex-wrap justify-center gap-12 sm:gap-24">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Final Score</p>
                        <p className={`text-4xl font-bold ${quizScore.percentage >= 75 ? 'text-green-500' : 'text-red-500'}`}>
                          {Math.round(quizScore.percentage)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Correct Details</p>
                        <p className="text-4xl font-bold text-gray-900">{quizScore.points} <span className="text-xl text-gray-400">/ {quizScore.total}</span></p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Incorrect</p>
                        <p className="text-4xl font-bold text-gray-900">{quizScore.total - quizScore.points}</p>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const correctQuestions = generatedQuiz?.questions.filter(q => userAnswers[q.id] === q.answer) || [];
                    const incorrectQuestions = generatedQuiz?.questions.filter(q => userAnswers[q.id] !== q.answer) || [];

                    return (
                      <>
                        {/* Incorrect Answers Section */}
                        {incorrectQuestions.length > 0 && (
                          <div className="mb-10">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">Review: Incorrect Answers ({incorrectQuestions.length})</h4>
                            <div className="space-y-4">
                              {incorrectQuestions.map((q, i) => (
                                 <div key={`inc-${i}`} className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
                                    <p className="font-bold text-gray-900 mb-4">{q.question}</p>
                                    <div className="flex flex-col gap-3 mb-4">
                                      <p className="text-gray-600"><span className="font-bold text-gray-900">Your Answer:</span> {q.options[userAnswers[q.id]] || 'No Answer'}</p>
                                      <p className="text-gray-600"><span className="font-bold text-gray-900">Correct Answer:</span> {q.options[q.answer]}</p>
                                    </div>
                                    {q.explanation && (
                                      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded border border-gray-100">
                                        <span className="font-bold block mb-1">Explanation:</span> {q.explanation}
                                      </div>
                                    )}
                                 </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Correct Answers Section */}
                        {correctQuestions.length > 0 && (
                          <div className="mb-8">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">Review: Correct Answers ({correctQuestions.length})</h4>
                            <div className="space-y-4">
                              {correctQuestions.map((q, i) => (
                                 <div key={`cor-${i}`} className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
                                    <p className="font-bold text-gray-900 mb-4">{q.question}</p>
                                    <p className="text-gray-600"><span className="font-bold text-gray-900">Your Answer:</span> {q.options[q.answer]}</p>
                                 </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)} className="px-8 py-3 rounded-[2rem] font-bold text-gray-500 hover:text-gray-900 border-gray-100">
                      Close
                    </Button>
                    <Button variant="outline" onClick={generateQuiz} className="px-8 py-3 rounded-[2rem] font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
                      Generate New Quiz
                    </Button>
                    <Button variant="primary" onClick={downloadQuizText} className="px-8 py-3 rounded-[2rem] font-bold shadow-lg shadow-blue-100">
                      Download Quiz (Text)
                    </Button>
                  </div>
                </div>
              )}
              {quizScore && isQuizStarted && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                   {/* Remove the blocking modal, just auto-show the beautiful inline results! */}
                </div>
              )}
            </div>
          )}
        </Modal>
    </DashboardLayout>
  );
};

export default Chat;
