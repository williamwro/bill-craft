
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Bill, useBills } from '@/context/BillContext';
import { Category } from '@/hooks/useCategoryManagement';
import { DepositorProvider, useDepositors, Depositor } from '@/context/DepositorContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import LottieSuccess from '@/components/LottieSuccess';
import successAnimation from '@/assets/success-animation.json';
import Select from 'react-select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { getCategoryInfo } from '@/utils/formatters';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

const billSchema = z.object({
  id_depositante: z.string({
    required_error: "O depositante é obrigatório",
  }),
  amount: z.string().refine(val => {
    if (val === '') return true;
    return !isNaN(parseFloat(val)) && parseFloat(val) > 0;
  }, {
    message: 'O valor deve ser um número maior que zero',
  }),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Data de vencimento inválida',
  }),
  category: z.string(),
  id_categoria: z.string().nullable(),
  status: z.enum(['paid', 'unpaid']),
  notes: z.string().optional(),
  numero_nota_fiscal: z.string().optional(),
  hasInstallments: z.boolean().default(false),
  installmentsCount: z.string().refine(val => {
    if (val === '') return true;
    const num = parseInt(val);
    return !isNaN(num) && num > 0 && num <= 48;
  }, {
    message: 'Número de parcelas deve ser um número entre 1 e 48',
  }).optional(),
  installmentsTotal: z.string().refine(val => {
    if (val === '') return true;
    return !isNaN(parseFloat(val)) && parseFloat(val) > 0;
  }, {
    message: 'Valor total deve ser um número maior que zero',
  }).optional(),
});

type BillFormValues = z.infer<typeof billSchema>;

// This wrapper is needed since we're using the DepositorProvider
const BillFormWrapper = () => {
  return (
    <DepositorProvider>
      <BillForm />
    </DepositorProvider>
  );
};

// Interface for the react-select options
interface SelectOption {
  value: string;
  label: string;
}

const BillForm = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { bills, getBill, addBill, updateBill, isLoading: billsLoading } = useBills();
  const { depositors, isLoading: depositorsLoading } = useDepositors();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bill, setBill] = useState<Bill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedDepositor, setSelectedDepositor] = useState<Depositor | null>(null);
  const [depositorOptions, setDepositorOptions] = useState<SelectOption[]>([]);
  
  const isEditMode = !!id;
  
  useEffect(() => {
    if (isEditMode && !billsLoading) {
      const foundBill = getBill(id);
      if (foundBill) {
        setBill(foundBill);
        
        // If the bill has a depositor, find it
        if (foundBill.id_depositante) {
          const findDepositor = depositors.find(d => d.id === foundBill.id_depositante);
          if (findDepositor) {
            setSelectedDepositor(findDepositor);
          }
        }
      } else {
        setError('Conta não encontrada');
      }
    }
  }, [id, getBill, isEditMode, billsLoading, depositors]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('nome_categoria', { ascending: true });

        if (error) {
          throw error;
        }

        setCategories(data || []);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        setError('Falha ao carregar categorias');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Create options for react-select from depositors
  useEffect(() => {
    if (depositors && depositors.length > 0) {
      const options = depositors.map(depositor => ({
        value: depositor.id,
        label: depositor.descri
      }));
      setDepositorOptions(options);
    }
  }, [depositors]);
  
  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      id_depositante: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      category: '',
      id_categoria: null,
      status: 'unpaid',
      notes: '',
      numero_nota_fiscal: '',
      hasInstallments: false,
      installmentsCount: '',
      installmentsTotal: '',
    },
  });
  
  useEffect(() => {
    if (bill) {
      form.reset({
        id_depositante: bill.id_depositante || '',
        amount: bill.amount.toString(),
        dueDate: bill.dueDate.split('T')[0],
        category: bill.category,
        id_categoria: bill.id_categoria,
        status: bill.status,
        notes: bill.notes || '',
        numero_nota_fiscal: bill.numero_nota_fiscal || '',
        hasInstallments: false,
      });
    }
  }, [bill, form]);

  const hasInstallments = form.watch('hasInstallments');
  
  const onSubmit = async (values: BillFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Find the depositor to get its name
      const depositor = depositors.find(d => d.id === values.id_depositante);
      if (!depositor) {
        throw new Error('Depositante não encontrado');
      }

      if (values.hasInstallments && values.installmentsCount && values.installmentsTotal) {
        const installmentsCount = parseInt(values.installmentsCount);
        const totalAmount = parseFloat(values.installmentsTotal);
        const installmentAmount = totalAmount / installmentsCount;
        const firstDueDate = new Date(values.dueDate);
        
        const installmentPromises = Array.from({ length: installmentsCount }).map((_, index) => {
          const dueDate = new Date(firstDueDate);
          dueDate.setDate(dueDate.getDate() + (index * 30));
          
          const installmentBill = {
            // Use depositor name as vendor name
            vendorName: `${depositor.descri} - Parcela ${index + 1}/${installmentsCount}`,
            amount: installmentAmount,
            dueDate: dueDate.toISOString().split('T')[0],
            category: values.category,
            id_categoria: values.id_categoria,
            id_depositante: values.id_depositante,
            status: values.status,
            numero_nota_fiscal: values.numero_nota_fiscal,
            notes: values.notes ? `${values.notes} - Parcela ${index + 1} de ${installmentsCount}` : `Parcela ${index + 1} de ${installmentsCount}`,
          };
          
          return addBill(installmentBill);
        });
        
        await Promise.all(installmentPromises);
      } else {
        const formattedBill = {
          // Use depositor name as vendor name
          vendorName: depositor.descri,
          amount: values.amount === '' ? 0 : parseFloat(values.amount),
          dueDate: values.dueDate,
          category: values.category,
          id_categoria: values.id_categoria,
          id_depositante: values.id_depositante,
          status: values.status,
          numero_nota_fiscal: values.numero_nota_fiscal,
          notes: values.notes,
        };
        
        if (isEditMode && id) {
          updateBill(id, formattedBill);
        } else {
          addBill(formattedBill);
        }
      }
      
      toast.custom(() => (
        <div className="w-full min-w-[350px] md:min-w-[450px] bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-6 mb-4 border border-green-100 dark:border-green-800 animate-in slide-in-from-bottom-5">
          <div className="flex-1 w-0 flex items-center">
            <div className="w-16 h-16 flex-shrink-0">
              <LottieSuccess 
                animationData={successAnimation} 
                loop={false}
              />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-lg font-medium text-green-800 dark:text-green-300">
                Conta salva com sucesso!
              </p>
            </div>
          </div>
          <button 
            onClick={() => toast.dismiss()} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
          >
            <span className="sr-only">Fechar</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ), {
        duration: 3000,
        position: 'top-center',
      });
      
      setTimeout(() => {
        navigate('/bills');
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Ocorreu um erro ao salvar a conta. Tente novamente.');
      
      toast.error("Erro ao salvar conta", {
        description: "Ocorreu um erro ao salvar a conta. Tente novamente.",
        position: "top-center",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    
    if (selectedCategory) {
      form.setValue('id_categoria', categoryId);
      form.setValue('category', selectedCategory.nome_categoria);
    }
  };

  const handleDepositorChange = (option: SelectOption | null) => {
    if (option) {
      const depositor = depositors.find(d => d.id === option.value);
      if (depositor) {
        form.setValue('id_depositante', option.value);
        setSelectedDepositor(depositor);
      }
    } else {
      form.setValue('id_depositante', '');
      setSelectedDepositor(null);
    }
  };

  if (authLoading || (isEditMode && billsLoading) || loadingCategories || depositorsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-12 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col text-left mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Editar Conta' : 'Nova Conta'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isEditMode ? 'Atualize os detalhes da conta' : 'Preencha os detalhes da nova conta a pagar'}
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border dark:border-gray-700 p-6 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="id_depositante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depositante / Fornecedor</FormLabel>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Select
                            options={depositorOptions}
                            value={depositorOptions.find(option => option.value === field.value) || null}
                            onChange={handleDepositorChange}
                            placeholder="Selecione ou digite para buscar"
                            isClearable
                            isSearchable
                            noOptionsMessage={() => "Nenhum depositante encontrado"}
                            classNames={{
                              control: (state) => 
                                `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${state.isFocused ? 'ring-2 ring-ring ring-offset-2' : ''}`,
                              placeholder: () => "text-muted-foreground",
                              input: () => "text-sm",
                              menu: () => "bg-white dark:bg-gray-800 mt-1 shadow-lg rounded-md border",
                              option: (state) => 
                                `px-3 py-2 ${state.isFocused ? 'bg-gray-100 dark:bg-gray-700' : ''}`,
                            }}
                          />
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          asChild
                        >
                          <Link to="/depositors/new">
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Novo Depositante</span>
                          </Link>
                        </Button>
                      </div>
                      
                      {selectedDepositor && (
                        <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-md text-sm">
                          <div className="font-medium">{selectedDepositor.descri}</div>
                          {selectedDepositor.cidade && selectedDepositor.uf && (
                            <div className="text-muted-foreground mt-1">
                              {selectedDepositor.cidade}, {selectedDepositor.uf}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {!hasInstallments && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="" 
                              {...field} 
                              type="number"
                              step="0.01"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Vencimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="numero_nota_fiscal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Nota Fiscal</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: NF-e 123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="id_categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <ShadcnSelect 
                          onValueChange={(value) => handleCategoryChange(value)} 
                          defaultValue={field.value || undefined}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center">
                                  <span className="mr-2">{getCategoryInfo(category.nome_categoria.toLowerCase()).icon}</span>
                                  <span>{category.nome_categoria}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </ShadcnSelect>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <ShadcnSelect 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unpaid">Pendente</SelectItem>
                            <SelectItem value="paid">Pago</SelectItem>
                          </SelectContent>
                        </ShadcnSelect>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="hasInstallments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Parcelamento</FormLabel>
                        <FormDescription>
                          Dividir esta conta em parcelas mensais
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isEditMode}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {hasInstallments && !isEditMode && (
                  <div className="space-y-4 rounded-lg border p-4 bg-slate-50">
                    <h3 className="font-medium text-lg">Configuração das Parcelas</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="installmentsCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade de Parcelas</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="48"
                                placeholder="Ex: 12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="installmentsTotal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Total</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Valor total da conta"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data do Primeiro Vencimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="text-sm text-muted-foreground mt-2">
                      <p>As parcelas serão criadas com 30 dias de intervalo entre cada vencimento.</p>
                      
                      {form.watch('installmentsCount') && form.watch('installmentsTotal') && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                          <p className="font-medium text-blue-800">
                            Valor de cada parcela: R$ 
                            {(parseFloat(form.watch('installmentsTotal') || '0') / 
                              parseInt(form.watch('installmentsCount') || '1')).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Informações adicionais sobre esta conta" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/bills')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      isEditMode ? 'Atualizar' : 'Salvar'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BillFormWrapper;
