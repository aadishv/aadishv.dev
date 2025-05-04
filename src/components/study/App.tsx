import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Input } from "../ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "../ui/dialog";
import { 
  PlusCircle, 
  Trash2, 
  Info, 
  Image as ImageIcon, 
  FileText, 
  File as FileIcon,
  FileType,
  FileCode,
  X,
  Loader2
} from "lucide-react";
import { processCardWithAI } from "../../lib/aiService";

// Import config for model name
import config from "../../lib/config";

interface FileData {
  name: string;
  type: string;
  data: string; // Base64 for images and PDFs, raw text for other files
  id: string;
}

interface StudyCard {
  id: string;
  content: string;
  type: 'text' | 'file';
  data?: string; // For text cards
  files?: FileData[]; // For file cards
}

interface AnalysisResult {
  cardId: string;
  descriptions: string[];
}

export default function StudyApp() {
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const addCard = (type: 'text' | 'file') => {
    const newCard: StudyCard = {
      id: `card-${Date.now()}`,
      content: '',
      type,
      ...(type === 'text' ? { data: '' } : { files: [] }),
    };
    setCards([...cards, newCard]);
  };

  const deleteCard = (id: string) => {
    const cardToDelete = cards.find(card => card.id === id);
    
    // Check if card has content, data, or files before confirming deletion
    if (cardToDelete && (
      cardToDelete.content.trim() !== '' || 
      (cardToDelete.type === 'text' && cardToDelete.data && cardToDelete.data.trim() !== '') ||
      (cardToDelete.type === 'file' && cardToDelete.files && cardToDelete.files.length > 0)
    )) {
      if (!window.confirm("This card has content. Are you sure you want to delete it?")) {
        return;
      }
    }
    
    setCards(cards.filter(card => card.id !== id));
  };

  const updateCardContent = (id: string, content: string) => {
    setCards(
      cards.map(card => 
        card.id === id ? { ...card, content } : card
      )
    );
  };

  const updateCardData = (id: string, data: string) => {
    setCards(
      cards.map(card => 
        card.id === id && card.type === 'text' ? { ...card, data } : card
      )
    );
  };

  const addFileToCard = (cardId: string, fileData: FileData) => {
    setCards(
      cards.map(card => 
        card.id === cardId && card.type === 'file' 
          ? { 
              ...card, 
              files: [...(card.files || []), fileData]
            } 
          : card
      )
    );
  };

  const removeFileFromCard = (cardId: string, fileId: string) => {
    setCards(
      cards.map(card => 
        card.id === cardId && card.type === 'file' && card.files 
          ? { 
              ...card, 
              files: card.files.filter(file => file.id !== fileId)
            } 
          : card
      )
    );
  };


  // Function to process cards with AI
  const processCards = async () => {
    // Only process if we have cards
    if (cards.length === 0) {
      alert("Please add at least one card to process.");
      return;
    }

    // Check if API key is stored
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (!storedApiKey) {
      setApiKeyDialogOpen(true);
      return;
    }

    setIsProcessing(true);
    setResults([]);

    try {
      console.log("Processing cards with AI...");
      // Process each card with the AI service
      const processedResults = await Promise.all(
        cards.map(async (card, index) => {
          console.log(`Processing card ${index + 1}/${cards.length}`);
          // Map our card to the format expected by the AI service
          const cardData = {
            type: card.type,
            content: card.content,
            data: card.type === 'text' ? card.data : undefined,
            files: card.type === 'file' ? card.files?.map(file => ({
              name: file.name,
              type: file.type,
              data: file.data
            })) : undefined
          };

          
          try {
            // Process the card with AI
            const descriptions = await processCardWithAI(cardData);
            
            return {
              cardId: card.id,
              descriptions
            };
          } catch (cardError) {
            console.error(`Error processing card ${index + 1}:`, cardError);
            return {
              cardId: card.id,
              descriptions: [`Error: ${cardError.message || "Unknown error processing this card"}`]
            };
          }
        })
      );
      
      console.log("All cards processed:", processedResults);
      setResults(processedResults);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error processing cards:", error);
      alert(`There was an error processing your cards: ${error.message || "Unknown error"}. Please check your API key and try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle API key submission
  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      // Save API key to localStorage
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setApiKeyDialogOpen(false);
      // Process cards after setting API key
      setTimeout(() => processCards(), 100);
    }
  };

  // Check if API key exists
  const hasApiKey = () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('gemini_api_key');
    }
    return false;
  };

  // Clear API key from localStorage
  const clearApiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
      alert('API key has been removed');
    }
  };

  // Open API key management dialog
  const openApiKeySettings = () => {
    // Get current API key (but don't display it)
    const hasKey = hasApiKey();
    if (hasKey && !apiKey) {
      setApiKey('••••••••••••••••'); // Placeholder for security
    }
    setApiKeyDialogOpen(true);
  };

  useEffect(() => {
    // Check for API key on component mount
    if (hasApiKey() && !apiKey) {
      setApiKey('••••••••••••••••'); // Placeholder for security
    }
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Study Cards</h1>
        <div className="flex gap-2 items-center">
          {hasApiKey() && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={openApiKeySettings}
              className="text-muted-foreground"
              title="API Key Settings"
            >
              <span className="mr-1 text-xs">API Key</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10h-4a2 2 0 1 0 0 4h4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2z" />
                <circle cx="7" cy="12" r="2" />
              </svg>
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => addCard('text')}>
              <PlusCircle size={18} className="mr-1" />
              Text Card
            </Button>
            <Button variant="outline" onClick={() => addCard('file')}>
              <PlusCircle size={18} className="mr-1" />
              File Card
            </Button>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>No cards available</AlertTitle>
          <AlertDescription>
            Click the "Add Card" button above to create your first study card.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, index) => (
            <Card key={card.id} className="transition-all hover:shadow-md">
              <CardHeader className="relative pb-0">
                <div className="absolute top-2 right-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteCard(card.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor={`type-${card.id}`} className="text-sm font-medium">
                      Type
                    </label>
                    <Input
                      id={`type-${card.id}`}
                      value={card.content}
                      onChange={(e) => updateCardContent(card.id, e.target.value)}
                      placeholder="Enter card type..."
                    />
                  </div>
                  
                  {card.type === 'text' ? (
                    <div className="space-y-2">
                      <label htmlFor={`text-${card.id}`} className="text-sm font-medium">
                        Text Content
                      </label>
                      <textarea
                        id={`text-${card.id}`}
                        value={card.data}
                        onChange={(e) => updateCardData(card.id, e.target.value)}
                        placeholder="Paste or type text content here..."
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor={`file-${card.id}`} className="text-sm font-medium">
                          Files
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {card.files?.length || 0} file{card.files?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {/* File display area */}
                      {card.files && card.files.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {card.files.map((file) => {
                            const getFileIcon = () => {
                              if (file.type.startsWith('image/')) return <ImageIcon size={16} />;
                              if (file.type === 'application/pdf') return <FileType size={16} />;
                              if (file.type.includes('text/')) return <FileText size={16} />;
                              if (file.type.includes('code') || 
                                  file.type.includes('javascript') || 
                                  file.type.includes('html') || 
                                  file.type.includes('css')) {
                                return <FileCode size={16} />;
                              }
                              return <FileIcon size={16} />;
                            };
                            
                            return (
                              <div
                                key={file.id} 
                                className="flex items-center justify-between rounded-full border border-input pl-3 pr-1 py-1 bg-background text-sm hover:border-primary"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {getFileIcon()}
                                  <span className="truncate max-w-[180px]">{file.name}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => removeFileFromCard(card.id, file.id)}
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Drop zone */}
                      <div 
                        className="border border-dashed border-input hover:border-primary rounded-md p-6 text-center cursor-pointer transition-colors"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            Array.from(e.dataTransfer.files).forEach(file => {
                              const reader = new FileReader();
    
                              reader.onload = (event) => {
                                if (event.target && event.target.result) {
                                  const newFile: FileData = {
                                    id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                    name: file.name,
                                    type: file.type || 'application/octet-stream',
                                    data: event.target.result.toString()
                                  };
                                  addFileToCard(card.id, newFile);
                                }
                              };
    
                              if (file.type.startsWith('image/')) {
                                reader.readAsDataURL(file);
                              } else if (file.type === 'application/pdf') {
                                reader.readAsDataURL(file);
                              } else {
                                reader.readAsText(file);
                              }
                            });
                          }
                        }}
                        onClick={() => {
                          const input = document.getElementById(`file-input-${card.id}`);
                          if (input) {
                            input.click();
                          }
                        }}
                      >
                        <input
                          id={`file-input-${card.id}`}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              Array.from(e.target.files).forEach(file => {
                                const reader = new FileReader();
                                
                                reader.onload = (event) => {
                                  if (event.target && event.target.result) {
                                    const newFile: FileData = {
                                      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                      name: file.name,
                                      type: file.type || 'application/octet-stream',
                                      data: event.target.result.toString()
                                    };
                                    addFileToCard(card.id, newFile);
                                  }
                                };
                                
                                if (file.type.startsWith('image/')) {
                                  reader.readAsDataURL(file);
                                } else if (file.type === 'application/pdf') {
                                  reader.readAsDataURL(file);
                                } else {
                                  reader.readAsText(file);
                                }
                              });
                            }
                          }}
                        />
                        
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <p>Drag and drop files here or click to browse</p>
                          <p className="text-xs mt-1">Supports multiple files</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submit button */}
      <div className="mt-8 flex justify-center">
        <Button 
          onClick={processCards} 
          disabled={isProcessing || cards.length === 0}
          className="w-full max-w-md"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Analyze Cards with AI'
          )}
        </Button>
      </div>

      {/* Results Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Analysis Results</DialogTitle>
            <DialogDescription>
              Here are the descriptions generated for your cards.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 my-4">
            {results.map((result, resultIndex) => {
              // Find the corresponding card to get its type
              const card = cards.find(c => c.id === result.cardId);
              if (!card) return null;
              
              return (
                <div key={result.cardId} className="p-4 rounded-lg border bg-card">
                  <div className="font-medium mb-2 flex items-center">
                    {card.type === 'text' ? (
                      <FileText className="mr-2 h-4 w-4" />
                    ) : (
                      <FileIcon className="mr-2 h-4 w-4" />
                    )}
                    Card {resultIndex + 1}: {card.type === 'text' ? 'Text' : 'Files'} 
                    <span className="ml-2 text-muted-foreground font-normal text-sm">
                      {card.content ? `(${card.content})` : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-2 pl-6">
                    {result.descriptions.map((description, index) => (
                      <div key={index} className="p-3 rounded-md bg-muted/50">
                        <p className="text-sm">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{hasApiKey() ? 'Manage API Key' : 'Enter Gemini API Key'}</DialogTitle>
            <DialogDescription>
              {hasApiKey() 
                ? 'Your API key is securely stored in your browser. You can replace it or remove it.' 
                : 'To analyze your cards, please enter your Google Gemini API key. This key will be stored securely in your browser\'s local storage.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                API Key
              </label>
              <Input
                id="api-key"
                type="password"
                placeholder={hasApiKey() ? "Enter new API key to replace current one" : "Enter your Gemini API key"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get an API key from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>.
                <br />
                Make sure your API key has access to the <span className="font-mono text-xs">{config.modelName}</span> model.
              </p>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            {hasApiKey() ? (
              <>
                <Button type="button" variant="destructive" onClick={clearApiKey}>
                  Remove API Key
                </Button>
                <Button 
                  type="button" 
                  onClick={handleApiKeySubmit} 
                  disabled={!apiKey.trim() || apiKey === '••••••••••••••••'}
                >
                  {apiKey.trim() && apiKey !== '••••••••••••••••' ? 'Update Key' : 'Close'}
                </Button>
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  Your key is stored only in this browser.
                </div>
                <Button type="button" onClick={handleApiKeySubmit} disabled={!apiKey.trim()}>
                  Save & Analyze
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
