const loadData = async () => {
    setIsLoading(true);
    try {
      // محاولة الجلب من السيرفر، مع الاعتماد على الـ localStorage كبديل فوري وآمن
      const [statsRes, ordersRes, prodsRes, catsRes, wilayasRes, settingsRes] =
        await Promise.all([
          fetch('/api/admin/dashboard-stats').catch(() => null),
          fetch('/api/admin/orders').catch(() => null),
          fetch('/api/public/products').catch(() => null),
          fetch('/api/public/categories').catch(() => null),
          fetch('/api/public/wilayas').catch(() => null),
          fetch('/api/public/settings').catch(() => null),
        ]);

      // 1. Stats & Orders (سحبها من الـ Server أو من التخزين المحلي الاحتياطي لضمان عدم ضياعها)
      if (statsRes && statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      } else {
        const localOrders = JSON.parse(localStorage.getItem('bk_admin_orders') || '[]');
        setStats({
          totalOrders: localOrders.length,
          newPendingOrders: localOrders.filter((o: any) => o.status === 'Nouvelle').length,
          recentOrders: localOrders.slice(0, 10),
          lowStockCount: 0
        });
      }

      if (ordersRes && ordersRes.ok) {
        const d = await ordersRes.json();
        setOrders(d.orders || []);
      } else {
        const localOrders = JSON.parse(localStorage.getItem('bk_admin_orders') || '[]');
        setOrders(localOrders);
      }

      // 2. Products (دمج منتجات السيرفر مع المنتجات المضافة محلياً لكي تظهر فوراً)
      let serverProducts = [];
      if (prodsRes && prodsRes.ok) {
        const d = await prodsRes.json();
        serverProducts = d.products || [];
      }
      const localProducts = JSON.parse(localStorage.getItem('bk_admin_products') || '[]');
      // دمج المنتجات بدون تكرار
      const mergedProducts = [...localProducts, ...serverProducts.filter((sp: any) => !localProducts.some((lp: any) => lp.id === sp.id))];
      setProducts(mergedProducts.length > 0 ? mergedProducts : serverProducts);

      if (catsRes && catsRes.ok) {
        const d = await catsRes.json();
        setCategories(d.categories || []);
      }
      if (wilayasRes && wilayasRes.ok) {
        const d = await wilayasRes.json();
        setWilayas(d.wilayas || []);
      }
      if (settingsRes && settingsRes.ok) {
        const d = await settingsRes.json();
        setSettings(d.settings || null);
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
      // Fallback local data
      setOrders(JSON.parse(localStorage.getItem('bk_admin_orders') || '[]'));
      setProducts(JSON.parse(localStorage.getItem('bk_admin_products') || '[]'));
    } finally {
      setIsLoading(false);
    }
  };