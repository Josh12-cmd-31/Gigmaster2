import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Rect, Circle, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Type, 
  Square, 
  Circle as CircleIcon, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Layers, 
  Sparkles, 
  DollarSign,
  Undo,
  Redo,
  MousePointer2,
  Plus
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Shape {
  id: string;
  type: 'text' | 'rect' | 'circle' | 'image';
  x: number;
  y: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  width?: number;
  height?: number;
  radius?: number;
  src?: string;
}

const ShapeComponent = ({ shape, isSelected, onSelect, onChange }: { 
  shape: Shape, 
  isSelected: boolean, 
  onSelect: () => void, 
  onChange: (newAttrs: any) => void 
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [img] = useImage(shape.src || '');

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    onClick: onSelect,
    onTap: onSelect,
    ref: shapeRef,
    draggable: true,
    onDragEnd: (e: any) => {
      onChange({
        ...shape,
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    onTransformEnd: (e: any) => {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange({
        ...shape,
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(node.height() * scaleY),
      });
    },
  };

  return (
    <>
      {shape.type === 'rect' && (
        <Rect
          {...commonProps}
          width={shape.width}
          height={shape.height}
          fill={shape.fill}
        />
      )}
      {shape.type === 'circle' && (
        <Circle
          {...commonProps}
          radius={shape.radius}
          fill={shape.fill}
        />
      )}
      {shape.type === 'text' && (
        <Text
          {...commonProps}
          text={shape.text}
          fontSize={shape.fontSize}
          fill={shape.fill}
        />
      )}
      {shape.type === 'image' && img && (
        <KonvaImage
          {...commonProps}
          image={img}
          width={shape.width}
          height={shape.height}
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default function LogoDesignerPage() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const stageRef = useRef<any>(null);

  const SERVICE_FEE_PERCENTAGE = 0.05;
  const BASE_PRICE = 49.99;
  const serviceFee = BASE_PRICE * SERVICE_FEE_PERCENTAGE;
  const totalPrice = BASE_PRICE + serviceFee;

  const addShape = (type: Shape['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newShape: Shape = {
      id,
      type,
      x: 100,
      y: 100,
      fill: '#3B82F6',
      ...(type === 'rect' && { width: 100, height: 100 }),
      ...(type === 'circle' && { radius: 50 }),
      ...(type === 'text' && { text: 'New Text', fontSize: 24 }),
    };
    setShapes([...shapes, newShape]);
    setSelectedId(id);
  };

  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'logo-design.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSelected = () => {
    if (selectedId) {
      setShapes(shapes.filter(s => s.id !== selectedId));
      setSelectedId(null);
    }
  };

  const generateLogoIdea = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ 
          text: `Suggest 3 modern logo design concepts for a business described as: ${prompt}. 
                 Include color palette (HEX), font style, and key visual elements. 
                 Keep it concise and professional.` 
        }],
      });
      // For now, we just show the text idea. In a real app, we could try to auto-generate shapes.
      alert(response.text);
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Logo Designer Studio</h1>
              <p className="text-slate-400 text-sm">Create professional logos with AI assistance</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleExport}
              className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-all"
            >
              <Download className="w-4 h-4" /> Export Design
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio */}
      <div className="flex-grow flex flex-col lg:flex-row">
        {/* Left Toolbar */}
        <div className="w-full lg:w-20 bg-white border-r border-slate-200 flex lg:flex-col items-center py-6 gap-6 px-4 lg:px-0">
          <button onClick={() => addShape('rect')} className="p-3 rounded-xl hover:bg-slate-100 text-slate-600" title="Add Square">
            <Square className="w-6 h-6" />
          </button>
          <button onClick={() => addShape('circle')} className="p-3 rounded-xl hover:bg-slate-100 text-slate-600" title="Add Circle">
            <CircleIcon className="w-6 h-6" />
          </button>
          <button onClick={() => addShape('text')} className="p-3 rounded-xl hover:bg-slate-100 text-slate-600" title="Add Text">
            <Type className="w-6 h-6" />
          </button>
          <div className="h-px w-10 bg-slate-200 hidden lg:block"></div>
          <button onClick={deleteSelected} className="p-3 rounded-xl hover:bg-red-50 text-red-500" title="Delete Selected">
            <Trash2 className="w-6 h-6" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-grow bg-slate-200 flex items-center justify-center p-8 overflow-hidden">
          <div className="bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-300">
            <Stage
              width={800}
              height={600}
              ref={stageRef}
              onMouseDown={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) setSelectedId(null);
              }}
            >
              <Layer>
                {shapes.map((shape) => (
                  <ShapeComponent
                    key={shape.id}
                    shape={shape}
                    isSelected={shape.id === selectedId}
                    onSelect={() => setSelectedId(shape.id)}
                    onChange={(newAttrs) => {
                      const newShapes = shapes.slice();
                      const index = shapes.findIndex(s => s.id === shape.id);
                      newShapes[index] = newAttrs;
                      setShapes(newShapes);
                    }}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 bg-white border-l border-slate-200 p-6 space-y-8 overflow-y-auto">
          {/* AI Assistance */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Design Ideas
            </h3>
            <div className="space-y-2">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your brand..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm h-24 focus:border-primary focus:ring-0"
              />
              <button 
                onClick={generateLogoIdea}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
              >
                {isGenerating ? <Plus className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Get Ideas
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Properties */}
          {selectedId ? (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900">Properties</h3>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#000000', '#FFFFFF'].map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        const newShapes = shapes.slice();
                        const index = shapes.findIndex(s => s.id === selectedId);
                        newShapes[index].fill = color;
                        setShapes(newShapes);
                      }}
                      className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <MousePointer2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Select an object to edit its properties</p>
            </div>
          )}

          <div className="h-px bg-slate-100"></div>

          {/* Pricing & Service Fee */}
          <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Base Design Price</span>
                <span>${BASE_PRICE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service Fee (5%)</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-200 my-2"></div>
              <div className="flex justify-between font-bold text-slate-900 text-lg">
                <span>Total Amount</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
              Purchase Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
